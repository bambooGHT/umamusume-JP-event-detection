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
    const canvas = this._getCanvasFun(videoElement);
    const { tesseractWorker } = this;

    this.callback = async () => {
      const { data: { text } } = await tesseractWorker.recognize(await canvas());
      const tReplace = text.replaceAll(" ", "");
      // console.log(tReplace);
      callback(tReplace);
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
   * @returns { () => Promise<HTMLCanvasElement> }
   */
  _getCanvasFun(videoElement) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const { videoWidth: width, videoHeight: height } = videoElement;
    const sx = width * 0.151;
    const sy = (height - 30) / 10 * 1.84;
    const width1 = (width - sx) * 1.6;
    const height1 = 200 * 1.5;
    canvas.width = width1;
    canvas.height = height1;
    // document.getElementById("event").appendChild(canvas);

    context.scale(2.8, 2.5);
    const drawImage = () => {
      context.clearRect(0, 0, width1, height1);
      context.drawImage(videoElement, sx, sy, width1, height1, 0, 0, width1, height1);
    };

    const processImageData = () => {
      const imageData = context.getImageData(0, 0, width1, height1);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const brightness = 260 - ((data[i] + data[i + 1] + data[i + 2]) / 3);
        data[i] = data[i + 1] = data[i + 2] = brightness * 4;
      }

      context.putImageData(imageData, 0, 0);
    };

    return () => {
      drawImage();
      processImageData();
      return canvas;
    };
  }

  async _getWorker() {
    const { createWorker } = Tesseract;
    const worker = await createWorker({
      langPath: "https://github.com/tesseract-ocr/tessdata/raw/3.00_best/"
    });
    const lang = "jpn";
    await worker.loadLanguage(lang);
    await worker.initialize(lang);

    return worker;
  };
}