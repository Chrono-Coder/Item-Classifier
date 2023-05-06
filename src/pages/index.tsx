import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { useEffect, useState, useRef, useMemo, use } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { Button } from "../../components/ui/button";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";
export default function Home() {
	const detectorRef = useRef<any>();
	const [isCameraReady, setCameraReady] = useState(false);
	const [prediction, setPrediction] = useState<string | null>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isLoaded, setIsLoaded] = useState(false);

	const openCamera = async () => {
		try {
			// const isMobile = /iPhone|iPad|iPod|Android/i.test(
			// 	navigator.userAgent
			// );

			const devices = await navigator.mediaDevices.enumerateDevices();
			const cameras = devices.filter(
				(device) => device.kind === "videoinput"
			);

			const camera = await selectCamera(cameras);
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { deviceId: camera.deviceId },
			});
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}
		} catch (err) {
			console.log(err);
		}
	};
	const selectCamera = async (cameras: any) => {
		// if (cameras.length === 1) return cameras[0];
		return Swal.fire({
			title: "Select camera",
			input: "select",
			inputOptions: cameras.reduce((options: any, camera: any) => {
				options[camera.deviceId] = camera.label;
				return options;
			}, {}),
			inputPlaceholder: "Select camera",
			showCancelButton: true,
		}).then((result) => {
			if (result.isConfirmed) {
				const deviceId = result.value;
				setCameraReady(true);
				return cameras.find(
					(camera: any) => camera.deviceId === deviceId
				);
			} else {
				throw new Error("Camera selection was cancelled");
			}
		});
	};

	useEffect(() => {
		openCamera();
	}, [isLoaded]);

	useEffect(() => {
		if (isCameraReady) {
			setTimeout(() => {
				detectFromVideo();
			}, 3000);
		}
	}, [isCameraReady]);

	useEffect(() => {
		const loadModel = async () => {
			try {
				const modal2 = await cocoSsd.load();
				detectorRef.current = modal2;
				const backend = tf.getBackend();
				setIsLoaded(true);
			} catch (err) {
				console.log(err);
			}
		};

		loadModel();
	}, []);

	const detectFromVideo = async () => {
		if (!videoRef.current) return;
		const video = videoRef.current;
		const detections = await detectorRef.current.detect(video);
		const predictions = detections.map((detection: any) => {
			return `${detection.class} - ${Math.round(detection.score * 100)}%`;
		});
		setPrediction(predictions.join(", "));
		const old = document.getElementById("overlay");
		if (old) {
			old.remove();
		}
		const overlayCanvas = document.createElement("canvas");
		overlayCanvas.id = "overlay";
		overlayCanvas.width = video.videoWidth;
		overlayCanvas.height = video.videoHeight;
		overlayCanvas.style.position = "absolute";
		overlayCanvas.style.top = `${video.offsetTop}px`;
		overlayCanvas.style.left = `${video.offsetLeft}px`;
		video.parentNode?.appendChild(overlayCanvas);
		const overlayCtx = overlayCanvas.getContext("2d");
		if (!overlayCtx) return;

		detections.forEach((object: any) => {
			const [x, y, width, height] = object.bbox;
			overlayCtx.strokeStyle = "#EB772B";
			overlayCtx.lineWidth = 2;
			overlayCtx.beginPath();
			overlayCtx.rect(x, y, width, height);
			overlayCtx.stroke();
			overlayCtx.closePath();
		});

		requestAnimationFrame(detectFromVideo);
	};

	// useEffect(() => {
	// 	if (predicting) detectFromVideo();
	// }, [predicting, videoRef]);

	if (!isLoaded)
		return (
			<div
				className={`bg-[#171A2C] flex h-screen w-screen items-center justify-center   ${inter.className}`}
			>
				<Loader2 className='w-44 h-44 text-5xl text-[#EB772B] duration-1000 animate-spin ' />
			</div>
		);
	return (
		<div
			className={`bg-[#171A2C] flex flex-col gap-10 h-screen w-screen items-center justify-center py-24 px-7   ${inter.className}`}
		>
			<h1 className='text-5xl font-bold text-center text-[#C9CAD5] fixed top-8 '>
				Item Predictor
			</h1>
			{isCameraReady && (
				<video
					ref={videoRef}
					autoPlay
					muted
					playsInline
					style={{ maxWidth: "100%" }}
					className=' rounded-md p-2 outline-none focus:border-[#6c7ae0] transition-colors duration-150 relative'
				/>
			)}

			{prediction && (
				<div className=''>
					<h1 className='text-3xl font-bold text-center text-[#C9CAD5]'>
						{prediction}
					</h1>
				</div>
			)}
			{/* <Button
				className='text-black bg-gradient-to-tr from-[#EB772B] to-[#ffad66] hover:scale-[101%] ease-in-out duration-100 transition-all hover:bg-[#EB772B] hover:bg-opacity-90 rounded-full'
				onClick={openCamera}
			>
				{!isCameraReady ? "Open Camera" : "Change Camera"}
			</Button> */}
		</div>
	);
}
