class RecordingManager {
    // Add chunks every 1000 ms
    static RECORDING_FREQ = 1000;

    constructor() {
        this.recorder = null;
        this.streams = {};
        this.chunks = [];
    }

    addStream(k, stream) {
        this.streams[k] = stream;
        if (this.recorder) {
            this.setupRecorder();
            console.log(this.RECORDING_FREQ);
            this.recorder.start(this.RECORDING_FREQ);
        }
    }

    removeStream(k) {
        delete this.streams[k];
        if (this.recorder) {
            this.setupRecorder();
            this.recorder.start(this.RECORDING_FREQ);
        }
    }

    download() {
        console.log("downloading these chunks...", this.chunks);
        let blob = new Blob(this.chunks, {
            type: "audio/webm",
        });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download = "test.webm";
        a.click();
        window.URL.revokeObjectURL(url);

        this.chunks = [];
    }

    setupRecorder() {
        if (this.recorder) {
            this.recorder.stop();
        }

        const cont = new AudioContext();
        const dest = cont.createMediaStreamDestination();
        const streamsToAdd = Object.values(this.streams).map((stream) =>
            cont.createMediaStreamSource(stream)
        );
        streamsToAdd.forEach((stream) => stream.connect(dest));

        this.recorder = new MediaRecorder(dest.stream, { mimeType: "audio/webm" });
        const chunksRef = this.chunks;
        this.recorder.ondataavailable = function (e) {
            console.log(e.data);
            chunksRef.push(e.data);
        };
    }

    toggleRecord(e) {
        if (!this.recorder) {
            e.target.style.color = "red";
            this.setupRecorder();
            this.recorder.start(this.RECORDING_FREQ);
        } else {
            e.target.style.color = "black";
            this.recorder.stop();
            this.recorder = null;
            this.download();
        }
    }
}

export default RecordingManager;
