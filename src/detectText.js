/**
 * @typedef { {recognize: (value:string | Blob | HTMLCanvasElement) => Promise<{data:{text:string}}>} } TesseractWorker
 */
export class DetectText {
  /** @type {number | null} */
  timer = null;
  detectInterval = 500;
  /** @type { () => Promise<void> }  */
  callback;
  /** @type { TesseractWorker } */
  tesseractWorker = null;
  /** @type { HTMLVideoElement }  */
  videoElement = null;
  async initWorker() {
    this.tesseractWorker = await this._getWorker();
  }
  /** 
   * @param { HTMLVideoElement } videoElement
   * @param { (text: string) => void } callback
   */
  init(videoElement, callback) {
    this.videoElement = videoElement;
    const getImg = this._getImgFun(videoElement);
    const { tesseractWorker } = this;

    this.callback = async () => {
      const image = URL.createObjectURL(await getImg());
      const { data: { text } } = await tesseractWorker.recognize(image);

      URL.revokeObjectURL(image);
      callback(text.replaceAll(" ", ""));
    };
  }

  /** @param {number} interval  */
  updatedDetectInterval(interval) {
    console.log("current interval: " + interval + "ms");
    this.detectInterval = interval;
  }
  /** @type {() => void} */
  toggle = this._open;

  _open() {
    this.timer = 1;
    this._monitor();
    this.toggle = this._close;
  };

  _close() {
    clearTimeout(this.timer);
    this.timer = null;
    this.toggle = this._open;
  };

  _monitor() {
    this.callback().then(() => {
      if (!this.timer) return;
      this.timer = setTimeout(() => {
        this._monitor();
      }, this.detectInterval);
    });
  }
  /** 
   * @param { HTMLVideoElement } videoElement 
   * @returns { () => Promise<Blob> }
   */
  _getImgFun(videoElement) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const { videoWidth: width, videoHeight: height } = videoElement;
    const rgbValue = width * 0.355;
    const width1 = width + 60;
    const height1 = 160;
    const vWidth = width * 2.3;
    const vHeight = height * 2.2;
    const sx = width / 10 * 1.5;
    const sy = (height - 35) / 10 * 1.86;
    canvas.width = width1;
    canvas.height = height1;
    // document.getElementById("event").appendChild(canvas);

    const drawImage = () => {
      context.clearRect(0, 0, width1, height1);
      context.drawImage(videoElement, sx, sy, width1, height, 0, 0, vWidth, vHeight);
    };

    const processImageData = () => {
      const imageData = context.getImageData(0, 0, width1, height1);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const binaryValue = grayscale > rgbValue ? 255 : 0;
        data[i] = binaryValue;
        data[i + 1] = binaryValue;
        data[i + 2] = binaryValue;
      }
      context.putImageData(imageData, 0, 0);
    };

    return () => {
      drawImage();
      processImageData();
      return new Promise(res => canvas.toBlob((b) => res(b)));
    };
  }

  async _getWorker() {
    const { createWorker } = Tesseract;
    const worker = await createWorker({
      langPath: "https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0_best"
    });

    await worker.loadLanguage("jpn+eng");
    await worker.initialize("jpn+eng");

    return worker;
  };
}