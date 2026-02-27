import os
import sys
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

# Define the classes based on the dataset structure
CLASSES = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']

def load_model(model_path, num_classes, device):
    """Loads the trained ResNet18 model."""
    print(f"Loading model from {model_path}...")
    model = models.resnet18(pretrained=False) # No need for pretrained weights here
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, num_classes)
    
    # Load the trained weights
    model.load_state_dict(torch.load(model_path, map_location=device))
    model = model.to(device)
    model.eval() # Set to evaluation mode
    return model

def predict_image(image_path, model, device):
    """Predicts the class of an input image."""
    # Ensure the image exists
    if not os.path.exists(image_path):
        print(f"Error: Image '{image_path}' not found.")
        return None
    
    # Define the same transforms used during validation
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Load and preprocess the image
    try:
        image = Image.open(image_path).convert('RGB')
        input_tensor = transform(image).unsqueeze(0) # Add batch dimension
        input_tensor = input_tensor.to(device)
    except Exception as e:
        print(f"Error loading image: {e}")
        return None
    
    # Perform inference
    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
        
        # Get the predicted class and its probability
        max_prob, predicted_idx = torch.max(probabilities, 0)
        predicted_class = CLASSES[predicted_idx.item()]
        
        # Print top 3 predictions for more context
        print(f"\n--- Prediction Results for '{os.path.basename(image_path)}' ---")
        print(f"Top Prediction: {predicted_class.upper()} ({max_prob.item() * 100:.1f}% confidence)\n")
        
        print("All probabilities:")
        for idx, (cls, prob) in enumerate(zip(CLASSES, probabilities)):
            print(f"  {cls}: {prob.item() * 100:.1f}%")
            
        print("--------------------------------------------------")
        return predicted_class

def main():
    if len(sys.argv) < 2:
        print("Usage: python predict.py <path_to_image>")
        print("Example: python predict.py test_image.jpg")
        sys.exit(1)
        
    image_path = sys.argv[1]
    model_path = "best_model.pth"
    
    # Use GPU if available, otherwise CPU
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Ensure the model file exists
    if not os.path.exists(model_path):
         print(f"Error: Model file '{model_path}' not found.")
         print("Make sure you have run the training script successfully.")
         sys.exit(1)
         
    # Load the model step
    model = load_model(model_path, len(CLASSES), device)
    
    # Make the prediction
    predict_image(image_path, model, device)

if __name__ == "__main__":
    main()
