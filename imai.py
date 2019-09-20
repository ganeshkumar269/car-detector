from imageai.Detection import ObjectDetection
import os
import io
import sys
execution_path = os.getcwd()
inp_name = "traffic.jpg"
out_name = "output.jpg"
if sys.argv.__len__() > 1   :
    inp_name = "inputImage." + sys.argv[1]
    out_name = "output." + sys.argv[1]
print(inp_name)
print(out_name)
detector = ObjectDetection()
detector.setModelTypeAsTinyYOLOv3()
detector.setModelPath( os.path.join(execution_path , "models/yolo-tiny.h5"))
detector.loadModel()
custom = detector.CustomObjects(car=True,bus=True)
detections = detector.detectCustomObjectsFromImage(custom,input_image=os.path.join(os.path.join(execution_path ,"public"), inp_name), output_image_path=os.path.join(os.path.join(execution_path,"public") , out_name))
count=0
for eachObject in detections:
    print(eachObject["name"] , " : " , eachObject["percentage_probability"] )
    count +=1
print("No.of vehicles found : " + str(count))
file = open("tmp.txt","w")
file.write(str(count) + "\n")
file.close()