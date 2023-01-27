path_to_training_dataset = 'D:\\facultate\\Anul 3\\Semestrul 1\\Inteligenta Artificiala\\skin cancer\\Skin cancer ISIC The International Skin Imaging Collaboration\\Train\\'
import Augmentor
class_names=["actinic keratosis","basal cell carcinoma","dermatofibroma","melanoma","nevus","normal","pigmented benign keratosis","seborrheic keratosis","squamous cell carcinoma","vascular lesion"]
for i in class_names:
    print(i)
    direct='D:\\facultate\Anul 3\\Semestrul 1\\Inteligenta Artificiala\\skin cancer\\newdata\\Train\\'+str(i)
    print(direct)
    p = Augmentor.Pipeline(path_to_training_dataset + i, output_directory=direct)
    p.rotate(probability=0.7, max_left_rotation=10, max_right_rotation=10)
    p.sample(500)