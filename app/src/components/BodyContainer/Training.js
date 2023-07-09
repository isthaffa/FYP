import * as knnClassifier from "@tensorflow-models/knn-classifier";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";
import React, { useEffect, useRef, useState } from "react";

const TrainingPage = () => {
  const webcamRef = useRef(null);
  const [identity, setIdentity] = useState(0);
  const [classes, setClasses] = useState([]);
  const [uploadedModel, setUploadedModel] = useState(false);
  const predictionsRef = useRef(null);
  const confidenceRef = useRef(null);
  const inputClassNameRef = useRef(null);

  let mobilenetModel;
  let knnClassifierModel;
  let webcamInput;

  useEffect(() => {
    const createKNNClassifier = async () => {
      console.log("Loading KNN Classifier");
      return await knnClassifier.create();
    };

    const createMobileNetModel = async () => {
      console.log("Loading Mobilenet Model");
      return await mobilenet.load();
    };

    const createWebcamInput = async () => {
        console.log('Loading Webcam Input');
        const webcamElement = webcamRef.current;
        return await tf.data.webcam(webcamElement);
      };
  
    const initializeModels = async () => {
      mobilenetModel = await createMobileNetModel();
      knnClassifierModel = await createKNNClassifier();
      webcamInput = await createWebcamInput();
      imageClassificationWithTransferLearningOnWebcam();
    };
    const startWebcam = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            const video = webcamRef.current;
            video.srcObject = stream;
            video.play();
          })
          .catch((error) => {
            console.error('Error accessing webcam:', error);
          });
    };

    startWebcam();
    initializeModels();
  },[]);

  
  const addClass = () => {
    const inputClassName = inputClassNameRef.current.value;
    const found = classes.some((el) => el.name === inputClassName);
    if (!found) {
      setIdentity((prevIdentity) => prevIdentity + 1);
      setClasses((prevClasses) => [
        ...prevClasses,
        { id: identity + 1, name: inputClassName, count: 0 },
      ]);
    }
    inputClassNameRef.current.value = "";
  };

  const saveClassifier = (classifierModel) => {
    let datasets = classifierModel.getClassifierDataset();
    let datasetObject = {};
    let i = 0;
    Object.keys(datasets).forEach((key) => {
      let data = datasets[key].dataSync();
      datasetObject[classes[i].name] = Array.from(data);
      i += 1;
    });
    let jsonModel = JSON.stringify(datasetObject);
    let downloader = document.createElement("a");
    downloader.download = "model.json";
    downloader.href =
      "data:text/text;charset=utf-8," + encodeURIComponent(jsonModel);
    document.body.appendChild(downloader);
    downloader.click();
    downloader.remove();
  };

  const uploadModel = async (classifierModel, event) => {
    setUploadedModel(true);
    let inputModel = event.target.files;
    let fr = new FileReader();
    if (inputModel.length > 0) {
      fr.onload = async () => {
        var dataset = fr.result;
        var tensorObj = JSON.parse(dataset);

        Object.keys(tensorObj).forEach((key) => {
          tensorObj[key] = tf.tensor(tensorObj[key], [
            tensorObj[key].length / 1024,
            1024,
          ]);
          setClasses((prevClasses) => [...prevClasses, key]);
        });
        classifierModel.setClassifierDataset(tensorObj);
        console.log("Classifier has been set up! Congrats! ");
      };
    }
    await fr.readAsText(inputModel[0]);
  };

  const downloadModel = async (classifierModel) => {
    saveClassifier(classifierModel);
  };

  const addDatasetClass = async (classId) => {
    const img = await webcamInput.capture();
    const activation = mobilenetModel.infer(img, "conv_preds");
    knnClassifierModel.addExample(activation, classId);

    let classIndex = classes.findIndex((el) => el.id === classId);
    let currentCount = classes[classIndex].count;
    currentCount += 1;
    setClasses((prevClasses) => [
      ...prevClasses.slice(0, classIndex),
      { ...prevClasses[classIndex], count: currentCount },
      ...prevClasses.slice(classIndex + 1),
    ]);

    img.dispose();
  };
  const imageClassificationWithTransferLearningOnWebcam = async () => {
    console.log("Machine Learning on the web is ready");
    while (true) {
      if (knnClassifierModel.getNumClasses() > 0) {
        const img = await webcamInput.capture();
        const activation = mobilenetModel.infer(img, "conv_preds");
        const result = await knnClassifierModel.predictClass(activation);
        console.log(result);
     
        if (uploadedModel) {
          predictionsRef.current.innerHTML = result.label;
          confidenceRef.current.innerHTML = Math.floor(
            result.confidences[result.label] * 100
          );
        } else {
          try {
            console.log('IMMMM2');

            predictionsRef.current.innerHTML = classes[result.label - 1].name;
            confidenceRef.current.innerHTML = Math.floor(
              result.confidences[result.label] * 100
            );
          } catch (err) {
            console.log('IMMMM');
            predictionsRef.current.innerHTML = result.label - 1;
            confidenceRef.current.innerHTML = Math.floor(
              result.confidences[result.label] * 100
            );
          }
        }
        img.dispose();
      }
      await tf.nextFrame();
    }
  };

  const speakPrediction = () => {
    var msg = new SpeechSynthesisUtterance();
    msg.text = predictionsRef.current.innerHTML;
    window.speechSynthesis.speak(msg);
  };

  return (
    <div>
      <video ref={webcamRef} autoPlay></video>
      <div id="training-cards">
        {classes.map((classItem) => (
          <div className="newshifter" key={classItem.id}>
            <div className="text-center">
              <h3>
                Class Name : <span>{classItem.name}</span>
              </h3>
              <h3>
                Images :{" "}
                <span id={`images-${classItem.id}`}>{classItem.count}</span>
              </h3>
            </div>
            <div>
              <button
                className="dark btn-spread btn-shadow mr-5"
                id={classItem.id}
                onClick={() => addDatasetClass(classItem.id)}
              >
                Add New Images <i className="fas fa-plus fa-1x"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
      <div id="predictions" ref={predictionsRef}></div>
      <div id="confidence" ref={confidenceRef}></div>
      <input type="text" id="inputClassName" ref={inputClassNameRef} />
      <button id="add-button" onClick={addClass}>
        Add Class
      </button>
      <button id="btnSpeak" onClick={speakPrediction}>
        Speak Prediction
      </button>
      <input
        type="file"
        id="load_button"
        onChange={(event) => uploadModel(knnClassifierModel, event)}
      />
      <button
        id="save_button"
        onClick={() => downloadModel(knnClassifierModel)}
      >
        Download Model
      </button>
    </div>
  );
};

export default TrainingPage;
