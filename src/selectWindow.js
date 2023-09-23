export const selectWindow = async (options) => {
  const mediaDevices = navigator.mediaDevices;
  const screen = mediaDevices.getDisplayMedia ? await mediaDevices.getDisplayMedia(options) : await mediaDevices.getUserMedia(options);
  const videoElement = document.createElement("video");

  videoElement.srcObject = screen;
  await videoElement.play();

  return videoElement;
};