import React, { useEffect, useRef, useState } from 'react';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import axios from 'axios';

import sampleModel from './model.json';
import Header from '../Header/Header';

import NavBar from '../NavBar';

const letters = {
  ah: 'අ',
  ahh: 'ආ',
  aeh: 'ඇ',
  ee: 'ඉ',
  eeh: 'ඊ',
  uh: 'උ',
  uhh: 'ඌ',
  a: 'එ',
  ae: 'ඒ',
  o: 'ඔ',
  ohh: 'ඕ',
  k: 'ක්',
  ig: 'ග්',
  t: 'ටී',
};

const TrainingPage = () => {
  const webcamRef = useRef(null);

  const [mobileNetModel, setMobileNetModel] = useState(null);
  const [knnClassifierModel, setKnnClassifierModel] = useState(null);
  const [webcamInput, setWebcamInput] = useState(null);

  const [predictedLabel, setPredictedLabel] = useState(null);
  const [label, setLabel] = useState('');
  const [suggestionNode, setSuggestionNode] = useState('');

  useEffect(() => {
    const createKNNClassifier = async () => {
      console.log('Loading KNN Classifier');
      return await knnClassifier.create();
    };

    const createMobileNetModel = async () => {
      console.log('Loading Mobilenet Model');
      return await mobilenet.load();
    };

    const createWebcamInput = async () => {
      console.log('Loading Webcam Input');
      const webcamElement = webcamRef.current;
      return await tf.data.webcam(webcamElement);
    };

    const initializeModels = async () => {
      setMobileNetModel(await createMobileNetModel());
      setKnnClassifierModel(await createKNNClassifier());
      setWebcamInput(await createWebcamInput());
    };

    const startWebcam = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
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
  }, []);

  useEffect(() => {
    if (mobileNetModel && knnClassifierModel && webcamInput) {
      imageClassificationWithTransferLearningOnWebcam();
    }
  }, [mobileNetModel, knnClassifierModel, webcamInput]);

  // side effect to load model
  useEffect(() => {
    (async () => {
      if (!knnClassifierModel || !mobileNetModel || !webcamInput) {
        return;
      }
      const loadedModel = sampleModel;

      Object.keys(loadedModel).forEach((key) => {
        loadedModel[key] = tf.tensor(loadedModel[key], [
          loadedModel[key].length / 1024,
          1024,
        ]);
      });
      knnClassifierModel.setClassifierDataset(loadedModel);
      console.log('classifier has been set up!');
    })();
  }, [knnClassifierModel, mobileNetModel, webcamInput]);

  const imageClassificationWithTransferLearningOnWebcam = async () => {
    while (true) {
      if (knnClassifierModel.getNumClasses() > 0) {
        const img = await webcamInput.capture();
        const activation = mobileNetModel.infer(img, 'conv_preds');
        const result = await knnClassifierModel.predictClass(activation);
        if (predictedLabel !== result?.label) {
          setPredictedLabel(result?.label);
        }
        img.dispose();
      }
      await tf.nextFrame();
    }
  };

  function fetchSuggestion(wordInput) {
    try {
      axios
        .post('http://127.0.0.1:5001/sentence-suggest', { wordInput }, {})
        .then((response) => {
          debugger;
          setSuggestionNode(response.data.node);
        });
    } catch (e) {
      console.error(e);
    }
  }

  function handleSaveInput() {
    if (predictedLabel) {
      setLabel(label + letters[predictedLabel]);
      if (label.length > 1) {
        fetchSuggestion(label + letters[predictedLabel]);
      } else {
        setSuggestionNode('');
      }
    }
  }

  function handleSpaceInput() {
    setLabel(label + ' ');
  }

  function handleDeleteInput() {
    if (label && label.length > 0) {
      setLabel(label.substring(0, label.length - 1));
    }
  }

  function handleClearInput() {
    setLabel('');
  }

  function formatPredictedLabel(label) {
    if (!label) {
      return '';
    }
    return letters[label] || '';
  }

  return (
    <>
      <NavBar />
      <div className="web_cam__container">
        <Header removeBody />
        <video ref={webcamRef} autoPlay className="web_cam__video" />
        <h1 className="predicted_label__title">Predicted Label</h1>
        {predictedLabel && (
          <div className="predicted_label__container">
            <h3>{formatPredictedLabel(predictedLabel)}</h3>
          </div>
        )}
        <br />
        <div>
          <input value={label} className="label__input" disabled />
          {suggestionNode && suggestionNode !== '' && (
            <div>Suggestions: {suggestionNode}</div>
          )}
        </div>

        <div className="button_row">
          <button className="input_btn" onClick={handleSaveInput}>
            Save
          </button>
          <button className="input_btn" onClick={handleSpaceInput}>
            Space
          </button>
          <button className="input_btn" onClick={handleDeleteInput}>
            Delete
          </button>
          <button className="input_btn" onClick={handleClearInput}>
            Clear
          </button>
        </div>
        <button
          type="button"
          className="upload-file__button upload-file__button-grey"
          onClick={() => {
            window.location.href = '/';
          }}
        >
          Back{' '}
        </button>
      </div>
    </>
  );
};

export default TrainingPage;
