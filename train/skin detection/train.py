import cv2
import os
from PIL import Image
import numpy as np
from sklearn.model_selection import train_test_split
import tensorflow as tf
from keras.utils import normalize, to_categorical
from keras.models import Sequential
from keras.layers import Conv2D, MaxPooling2D, Activation, Dropout, Flatten, Dense, MaxPool2D
from tensorflow.python.framework.test_ops import Binary

dataset = []
label = []

INPUT_SIZE=150

def get_yes_data():
    folder_names = os.listdir(
        r"D:\facultate\Anul 3\Semestrul 1\Inteligenta Artificiala\skindetection\Skin cancer ISIC The International Skin Imaging Collaboration\Train")

    for name in folder_names:
        new_folder_name = "D:\\facultate\\Anul 3\\Semestrul 1\\Inteligenta Artificiala\\skin cancer\\Skin cancer ISIC The International Skin Imaging Collaboration\\Train\\" + name
        str_folder_name = new_folder_name
        new_folder_name = os.listdir(new_folder_name)
        for image in new_folder_name:
            if ".jpg" in image:
                read_image = cv2.imread(str_folder_name + "\\" + image)
                converted_image = Image.fromarray(read_image, 'RGB')
                converted_image = converted_image.resize((INPUT_SIZE, INPUT_SIZE))
                dataset.append(np.array(converted_image))
                label.append(1)
    # print(dataset)


def get_no_data():
    skin_images = os.listdir('D:/facultate/Anul 3/Semestrul 1/Inteligenta Artificiala/skindetection/no/')
    for image in skin_images:
        if ".jpg" in image:
            read_image = cv2.imread("D:/facultate/Anul 3/Semestrul 1/Inteligenta Artificiala/skindetection/no/" + image)
            converted_image = Image.fromarray(read_image, 'RGB')
            converted_image = converted_image.resize((INPUT_SIZE, INPUT_SIZE))
            dataset.append(np.array(converted_image))
            label.append(0)
    # print(dataset)




# 80% training, 20% testing
#splitting the dataset into train and test
def split_and_train_model():
    x_train, x_test, y_train, y_test = train_test_split(dataset, label,test_size=0.2,random_state=0)


    #normalize the data
    x_train=normalize(x_train)
    x_test=normalize(x_test)
    y_train=to_categorical(y_train,num_classes=2)
    y_test=to_categorical(y_test,num_classes=2)
    #build up the model
    #imaginile devin vectori
    model=Sequential()
    model.add(Conv2D(32, 3, padding="same", activation='relu'))
    model.add(MaxPool2D())

    model.add(Conv2D(64, 3, padding="same", activation='relu'))
    model.add(MaxPool2D())

    model.add(Conv2D(128, 3, padding="same", activation='relu'))
    model.add(MaxPool2D())
    model.add(Dropout(0.15))

    model.add(Flatten())
    model.add(Dense(256))
    model.add(Activation('relu'))
    model.add(Dense(2)) #categorical cross entropy
    model.add(Activation('softmax'))

    # Binary CrossEntropy=1, sigmoid
    # Categorical Cross Entropy=2,softmax

    model.compile(loss='categorical_crossentropy',optimizer='adam',metrics=['accuracy'])
    model.fit(x_train,y_train,batch_size=16,verbose=1,epochs=2,validation_data=(x_test,y_test),shuffle=False)
    model.save('skinornot.h5')


get_no_data()
get_yes_data()

dataset = np.array(dataset)
label = np.array(label)
split_and_train_model()

# print(x_train.shape)
# print(y_train.shape)