from flask import request, jsonify, Blueprint, send_file
from PIL import Image
import os
import numpy as np
import cv2
import uuid
import datetime
from flaskr.detection import Detection
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter

bp = Blueprint('yolo', __name__)

# Pastas de upload e relatórios
UPLOAD_FOLDER = os.path.abspath('uploads')
REPORT_FOLDER = os.path.abspath('reports')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REPORT_FOLDER, exist_ok=True)

# Carrega o detector YOLO
detection = Detection()

@bp.route('/upload', methods=['POST'])
def upload_image_and_generate_report():
    if 'image' not in request.files:
        return jsonify({"message": "Nenhuma parte do arquivo enviada"}), 400

    file = request.files['image']
    username = request.form.get("username", "Funcionário Desconhecido")

    if file.filename == '':
        return jsonify({"message": "Nenhum arquivo selecionado"}), 400

    # Salva imagem temporária
    filename = f"{uuid.uuid4().hex}.jpg"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Processa imagem
    img = Image.open(file_path).convert("RGB")
    img = np.array(img)
    img = cv2.resize(img, (512, 512))

    detected_classes = detection.detect_from_image(img)
    os.remove(file_path)

    if detected_classes:
        detected_class = detected_classes[0]
        report_filename = f"report_{uuid.uuid4().hex}.pdf"
        report_path = os.path.join(REPORT_FOLDER, report_filename)

        generate_safety_report(report_path, detected_class, username=username)
        return send_file(report_path, as_attachment=True, download_name=report_filename)

    return jsonify({"message": "Nenhum objeto detectado"}), 200


def generate_safety_report(filename, detected_class, username):
    # Mapeamento baseado no uso de EPI (capacete)
    report_details = {
        "com_capacete": {
            "diagnosis": "O trabalhador foi identificado utilizando o capacete de segurança corretamente.",
            "recommendations": [
                "Reforçar a importância do uso contínuo de EPIs.",
                "Registrar a conformidade como exemplo positivo.",
                "Manter treinamentos periódicos sobre segurança no trabalho."
            ]
        },
        "sem_capacete": {
            "diagnosis": "Foi identificado um trabalhador sem o uso do capacete de segurança.",
            "recommendations": [
                "Alertar imediatamente o colaborador sobre o risco.",
                "Providenciar treinamento sobre uso de EPIs.",
                "Registrar ocorrência e acompanhar reincidências.",
                "Verificar se há sinalização adequada no ambiente."
            ]
        }
    }

    # Conteúdo padrão caso a classe não seja reconhecida
    details = report_details.get(
        detected_class,
        {
            "diagnosis": "O sistema detectou uma classe não reconhecida. Recomendamos análise manual da imagem.",
            "recommendations": ["Revisar manualmente a imagem.", "Consultar o setor de segurança."]
        }
    )

    # Criação do documento
    doc = SimpleDocTemplate(filename, pagesize=letter)
    elements = []

    # Estilos de texto
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle', parent=styles['Heading1'], fontSize=18,
        leading=22, alignment=1, textColor=colors.darkblue
    )
    section_title_style = ParagraphStyle(
        'SectionTitleStyle', parent=styles['Heading2'], fontSize=14,
        leading=18, textColor=colors.darkred
    )
    normal_style = styles['Normal']

    # Cabeçalho
    elements.append(Paragraph("Relatório de Inspeção de EPIs", title_style))
    elements.append(Spacer(1, 20))

    # Tabela de informações do funcionário
    info = [
        ["Nome do Funcionário:", username],
        ["Data da Inspeção:", datetime.datetime.now().strftime("%d/%m/%Y")],
        ["Responsável Técnico:", "Eng. de Segurança Carlos Silva"]
    ]
    table = Table(info, colWidths=[160, 300])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))
    elements.append(table)
    elements.append(Spacer(1, 20))

    # Diagnóstico
    elements.append(Paragraph("Diagnóstico", section_title_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(details["diagnosis"], normal_style))
    elements.append(Spacer(1, 20))

    # Recomendações
    elements.append(Paragraph("Recomendações", section_title_style))
    elements.append(Spacer(1, 10))
    for i, rec in enumerate(details["recommendations"], 1):
        elements.append(Paragraph(f"{i}. {rec}", normal_style))
        elements.append(Spacer(1, 5))

    # Gerar PDF
    doc.build(elements)
    print(f"Relatório gerado: {filename}")
