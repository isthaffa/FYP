import React, { Component } from "react";
import signBody from "../../assets/images/sign-body.png";
import "./BodyContainer.scss";
import "./LoadingIcon.scss";

import axios from "axios";
import cameraIcon from "../../assets/icons/camera-icon.png";
import questionMark from "../../assets/icons/question-mark-icon.png";
import uploadIcon from "../../assets/icons/upload-icon.png";
import UploadedImage from "./UploadedImage/UploadedImage.js";

const imageUrl =
  process.env.PUBLIC_URL + "/b8b57d9ae3f1650a69628afd0bf1ab18--sri-lanka.jpg";

export default class BodyContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      fileUploading: false,
      responseFromAPI: null,
      predictions: null,
      imageFile: null,
      imageFileObjectURL: null,
    };
  }

  componentDidMount() {
    if (this.props.webcamCapture) {
      this.sendToAPI();
    }
  }

  getUploadedFileAsBinary = (event) => {
    this.setState({
      imageFile: event.target.files[0],
      imageFileObjectURL: URL.createObjectURL(event.target.files[0]),
    });
    console.log("Uploaded File:" + event.target.files[0]);
  };

  handleImageClick = () => {
    window.open(imageUrl, "_blank");
  };

  filterPredictions = (predictions) => {
    return predictions.map((pred) => ({
      letter: pred.letter
        .replace("O1", "Ö")
        .replace("A1", "Å")
        .replace("A2", "Ä"),
      confidence: pred.confidence.toFixed(2),
    }));
  };

  sendToAPI = () => {
    try {
      this.setState({
        loading: true,
      });
      const data = new FormData();
      data.append(
        "image",
        this.props.webcamCaptureBinary
          ? this.props.webcamCaptureBinary
          : this.state.imageFile
      );
      axios.post("http://127.0.0.1:5001/predict", data, {}).then((response) => {
        let predictions = this.filterPredictions(response.data.predictions);
        this.setState({
          responseFromAPI: response,
          predictions: predictions,
          loading: false,
        });
        console.log("Response from API:" + response.data.predictions);
      });
    } catch (error) {
      console.log(error);
    }
  };

  renderUploadButtonBeforeUpload = () => {
    return (
      <div className="buttons-container">
        <label
          htmlFor="file-upload"
          className="upload-file__button upload-file__button-grey"
        >
          {" "}
          {/* Is what is visible*/}
          Upload Image
          <img
            style={{ marginLeft: "10px" }}
            height="20px"
            alt="upload icon"
            src={uploadIcon}
          />
        </label>
        <input
          id="file-upload"
          className="upload-file__button"
          type="file"
          accept="image/*"
          onChange={this.getUploadedFileAsBinary}
        />
        {/* Is hidden via scss-file but contains the logic*/}
        <button
          type="button"
          className="upload-file__button"
          onClick={this.props.startWebcam}
        >
          Use Webcam{" "}
          <img
            style={{ marginLeft: "10px" }}
            height="20px"
            alt="camera icon"
            src={cameraIcon}
          />
        </button>
        <button
          type="button"
          className="upload-file__button upload-file__button-grey"
          onClick={this.props.startWebcamVideo}
        >
          Stream Video
          <img
            style={{ marginLeft: "10px" }}
            height="20px"
            alt="camera icon"
            src={cameraIcon}
          />
        </button>
      </div>
    );
  };

  renderUploadButtonAfterUpload = () => {
    return (
      <button
        type="button"
        className="upload-file__button"
        onClick={this.sendToAPI}
      >
        Confirm{" "}
        {this.state.imageFile.name.length > 10
          ? this.state.imageFile.name.substring(0, 10) + "..."
          : this.state.imageFile.name.substring(0, 10)}
      </button>
    );
  };

  renderloadingElement = () => {
    return (
      <div className="loading-icon__container">
        <h3>Getting prediction from server</h3>
        <div className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p>This could take up to 15 seconds when the server is booting up</p>
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.state.loading ? (
          this.renderloadingElement()
        ) : this.state.responseFromAPI ? (
          <div>
            <UploadedImage
              imageFileObjectURL={this.state.imageFileObjectURL}
              imageFile={this.state.imageFile}
              predictions={this.state.predictions}
              webcamCapture={this.props.webcamCapture}
            />
          </div>
        ) : (
          <div className="signs-button__container">
            <div className="signs-icons__container">
              <img
                className="sign-one"
                src={signBody}
                alt="sign-one"
                style={{ height: "250px", marginLeft: "5px" }}
              />
              {/* "Icons made by Freepik from www.flaticon.com" */}
              <p>
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={this.handleImageClick}
                >
                  Don't know any signs? Click here for instructions.
                </a>{" "}
              </p>
            </div>
            {!this.state.imageFile
              ? this.renderUploadButtonBeforeUpload()
              : this.renderUploadButtonAfterUpload()}
            <p className="upload__disclaimer">
              {" "}
              <img
                style={{ margin: "0px 5px" }}
                height="12px"
                alt="upload icon"
                src={questionMark}
              />{" "}
              Don't worry, we will not use or save your image anywhere.
            </p>
          </div>
        )}
      </div>
    );
  }
}
