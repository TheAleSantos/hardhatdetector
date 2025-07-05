from ultralytics import YOLO
import numpy as np
import cv2

class Detection:
    def __init__(self):
        self.model = YOLO(model=r"F:\trabalhofim\fullstack-with-yolo-main\demo\flaskr\best.pt")

    def predict(self, img, classes=[], conf=0.5):
        if classes:
            results = self.model.predict(img, classes=classes, conf=conf)
        else:
            results = self.model.predict(img, conf=conf)

        return results

    def predict_and_detect(self, img, classes=[], conf=0.5, rectangle_thickness=2, text_thickness=1):
        results = self.predict(img, classes, conf=conf)
        for result in results:
            for box in result.boxes:
                cv2.rectangle(
                    img,
                    (int(box.xyxy[0][0]), int(box.xyxy[0][1])),
                    (int(box.xyxy[0][2]), int(box.xyxy[0][3])),
                    (255, 0, 0),
                    rectangle_thickness
                )
                cv2.putText(
                    img,
                    f"{result.names[int(box.cls[0].item())]}",
                    (int(box.xyxy[0][0]), int(box.xyxy[0][1]) - 10),
                    cv2.FONT_HERSHEY_PLAIN,
                    1,
                    (255, 0, 0),
                    text_thickness
                )
        return img, results

    def detect_from_image(self, image):
        # Apenas detecta classes, sem desenhar
        results = self.model.predict(image, conf=0.5)
        detected_classes = []

        for result in results:
            if result.boxes is not None:
                for box in result.boxes:
                    cls_id = int(box.cls[0].item())
                    class_name = result.names[cls_id]
                    detected_classes.append(class_name)

        print("Detecções:", detected_classes)  # DEBUG: pode remover depois
        return detected_classes
