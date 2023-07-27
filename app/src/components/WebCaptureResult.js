import React, { useEffect, useState } from 'react';
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
  oh:'ඔ',
  ohh: 'ඕ',
  k: 'ක්',
  ig: 'ග්',
  t: 'ටී',
};
const WebCaptureResult = (props) => {
  const { toggleOffWebcamMode, webcamCapture, result } = props;

  const [topConfidences, setTopConfidences] = useState([]);

  useEffect(() => {
    if (result) {
      const topConfidencesArray = Object.entries(result.confidences)
        .filter(([key, value]) => value > 0.2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([key, value]) => ({
          letter: key,
          confidence: Math.round(value * 100),
        }));
      setTopConfidences(topConfidencesArray);
    }
  }, [result]);

  const renderSinglePrediction = (letter, confidence) => {
    return (
      <p className="single-prediction__container">
        <p className="preds-letter">{letters[letter]}</p>
        &nbsp;
        <p
          style={{
            color: '#333',
            fontSize: '17px',
            textAlign: 'center',
            margin: 0,
          }}
        >
          with {confidence-10}% confidence
        </p>
      </p>
    );
  };

  return (
    <div>
      <div className="container">
        <div className="first-column">
          <img className="image" src={webcamCapture} alt="" />
        </div>
        <div>
          <div className="second-column">
            <p className="second-column--title-text">
              {' '}
              Your sign translates to the letter:
            </p>
            <div>
              {topConfidences.map((val) =>
                renderSinglePrediction(val.letter || '', val.confidence || '')
              )}
            </div>

            <button
              type="button"
              className="upload-file__button upload-file__button-grey"
              onClick={toggleOffWebcamMode}
            >
              Back{' '}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebCaptureResult;
