import cv2
import os
from PIL import Image
import numpy as np
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow import keras
from keras.utils import normalize
from keras.models import Sequential
from keras.layers import Conv2D,MaxPooling2D,Activation,Dropout,Flatten,Dense
from tensorflow.python.framework.test_ops import Binary
from keras.utils import to_categorical

folder_names = os.listdir(
    r"D:\facultate\Anul 3\Semestrul 1\Inteligenta Artificiala\skin cancer\Skin cancer ISIC The International Skin Imaging Collaboration\Train")
dataset = []
label = []
INPUT_SIZE = 250
label_number = 0
for name in folder_names:
    new_folder_name = "D:\\facultate\\Anul 3\\Semestrul 1\\Inteligenta Artificiala\\skin cancer\\Skin cancer ISIC The International Skin Imaging Collaboration\\Train\\" + name
    str_folder_name=new_folder_name
    new_folder_name=os.listdir(new_folder_name)
    for image in new_folder_name:
        if ".jpg" in image:
            read_image = cv2.imread(str_folder_name + "\\" + image)
            converted_image = Image.fromarray(read_image, 'RGB')
            converted_image = converted_image.resize((INPUT_SIZE, INPUT_SIZE))
            dataset.append(np.array(converted_image))
            label.append(label_number)
    label_number = label_number+1
print(label_number)

x_train, x_test, y_train, y_test = train_test_split(dataset, label,test_size=0.2,random_state=0)


#normalize the data
x_train=normalize(x_train)
x_test=normalize(x_test)
y_train=to_categorical(y_train,num_classes=9)
y_test=to_categorical(y_test,num_classes=9)

#build up the model
#imaginile devin vectori
model=Sequential()
model.add(Conv2D(32,(3,3),input_shape=(INPUT_SIZE,INPUT_SIZE,3)))
model.add(Activation('relu'))
model.add(MaxPooling2D(pool_size=(2,2)))

model.add(Conv2D(32,(3,3),kernel_initializer='he_uniform'))
model.add(Activation('relu'))
model.add(MaxPooling2D(pool_size=(2,2)))

model.add(Conv2D(64,(3,3),kernel_initializer='he_uniform'))
model.add(Activation('relu'))
model.add(MaxPooling2D(pool_size=(2,2)))

model.add(Flatten())
model.add(Dense(64))
model.add(Activation('relu'))
model.add(Dropout(0.5))
model.add(Dense(9)) #binary cross entropy
model.add(Activation('softmax'))

# Binary CrossEntropy=1, sigmoid
# Categorical Cross Entropy=2,softmax

model.compile(loss='categorical_crossentropy',optimizer='adam',metrics=['accuracy'])
model.fit(x_train,y_train,batch_size=16,verbose=1,epochs=30,validation_data=(x_test,y_test),shuffle=False)
model.save('skincancer.h5')


