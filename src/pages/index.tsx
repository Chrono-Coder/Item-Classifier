import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
import { InputFile } from "@/../components/ui/inputFile";
import { Progress } from "@/../components/ui/progress";
import { useEffect, useState, useRef } from "react";
import { Button } from "../../components/ui/button";

import * as tf from "@tensorflow/tfjs";
type ModelType = tf.LayersModel | null;

export default function Home() {
	// const [progress, setProgress] = useState(13);
	const [model, setModel] = useState<ModelType>(null);
	const [image, setImage] = useState<ImageData | null>(null);
	const [prediction, setPrediction] = useState<string | null>(null);
	useEffect(() => {
		const loadModel = async () => {
			const model = await tf.loadLayersModel("/models/model.json");
			setModel(model);
		};

		loadModel();
	}, []);

	const predict = async () => {
		const classes = [
			"Bengal",
			"Main Coon",
			"Persian",
			"Scottish Fold",
			" Siamese",
		];
		const tensor = tf.browser
			.fromPixels(image as ImageData)
			.resizeNearestNeighbor([125, 125])
			.toFloat()
			.expandDims();
		const predictions = (await model?.predict(tensor)) as tf.Tensor;
		// console.log(predictions?);
		// console.log(probabilities);
		let pred = predictions.arraySync() as Array<Array<number>>;
		console.log("predictions", pred);
		console.log(
			"index",
			pred[0].findIndex((item: number) => item === 1)
		);
		setPrediction(classes[pred[0].findIndex((item: number) => item === 1)]);
	};

	return (
		<div
			className={`flex flex-col gap-10 min-h-screen items-center justify-center p-24 ${inter.className}`}
		>
			<h1>Cat Detector</h1>
			<InputFile image={image} setImage={setImage} />
			{/* <Progress value={progress} className='w-[66%]' /> */}
			<h1>{prediction}</h1>
			<Button onClick={predict}>Predict</Button>
		</div>
	);
}
