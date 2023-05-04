import Image from "next/image";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { InputFile } from "@/../components/ui/inputFile";
import { useEffect, useState, useRef, useMemo } from "react";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";

export default function Home() {
	const modelRef = useRef<any>();
	const [image, setImage] = useState<ImageData | null | undefined>(null);
	const [predicting, setPredicting] = useState(false);
	const [prediction, setPrediction] = useState<string | null>(null);
	const [stream, setStream] = useState<MediaStream | null>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [progress, setProgress] = useState(0);

	const version = 2;
	const alpha = 0.5;

	const openCamera = async () => {
		setPredicting(true);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
			});
			setStream(stream);
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		const loadModel = async () => {
			const cpuBackend = tf.findBackend("cpu");
			if (cpuBackend === null) {
				throw new Error("CPU backend not found.");
			}
			tf.setBackend("cpu");
			try {
				const modal = await mobilenet.load({ version, alpha });
				modelRef.current = modal;
			} catch (err) {
				console.log(err);
			}
		};

		loadModel();
	}, []);

	const predictFromVideo = async () => {
		if (!videoRef.current) return;
		const video = videoRef.current;
		const canvas = document.createElement("canvas");
		if (!video) return;
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext("2d");
		ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
		const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
		// preprocess imageData for your model
		try {
			const predictions = await modelRef.current.classify(imageData);
			const pred = predictions as Array<{
				className: string;
				probability: number;
			}>;
			console.log(pred);

			const maxIndex = pred.indexOf(
				pred.reduce((prev, current) =>
					prev.probability > current.probability ? prev : current
				)
			);
			// setTimeout(() => {
			setPrediction(pred[maxIndex].className);
			// setPredicting(false);
			// }, 1000);
		} catch (err) {
			console.log(err);
		}
		// get predicted class and update UI
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (predicting) {
			interval = setInterval(() => {
				if (videoRef.current) {
					predictFromVideo();
				}
			}, 5000);
		}
		return () => clearInterval(interval);
	}, [predicting, videoRef]);

	useEffect(() => {
		if (!predicting) return;
		let progressInterval: NodeJS.Timeout;
		if (progress < 100) {
			progressInterval = setInterval(() => {
				setProgress((prevProgress) => {
					if (prevProgress + 20 > 100) {
						return 100;
					} else {
						return prevProgress + 20;
					}
				});
			}, 1100);
		} else {
			setProgress(0);
		}
		return () => clearInterval(progressInterval);
	}, [progress, predicting]);

	return (
		<div
			className={`bg-[#171A2C] flex flex-col gap-10 h-screen w-screen items-center justify-center py-24 px-7   ${inter.className}`}
		>
			<h1 className='text-5xl font-bold text-center text-[#C9CAD5] fixed top-8 '>
				Item Predictor
			</h1>
			{predicting && (
				<video
					ref={videoRef}
					autoPlay
					style={{ maxWidth: "100%" }}
					className=' rounded-md p-2 outline-none focus:border-[#6c7ae0] transition-colors duration-150'
				/>
			)}

			{prediction && (
				<div className=''>
					<h1 className='text-3xl font-bold text-center text-[#C9CAD5]'>
						{prediction}
					</h1>
				</div>
			)}
			{predicting && <Progress value={progress} className='w-[18%] ' />}
			<Button
				className='text-black bg-gradient-to-tr from-[#EB772B] to-[#ffad66] hover:scale-[101%] ease-in-out duration-100 transition-all hover:bg-[#EB772B] hover:bg-opacity-90 rounded-full'
				onClick={openCamera}
			>
				Open Camera
			</Button>
		</div>
	);
}
