import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
import { InputFile } from "@/../components/ui/inputFile";
import { Progress } from "@/../components/ui/progress";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";

import * as tf from "@tensorflow/tfjs";
type ModelType = tf.LayersModel | null;

export default function Home() {
	// const [progress, setProgress] = useState(13);
	const [model, setModel] = useState<ModelType>(null);

	useEffect(() => {
		const loadModel = async () => {
			const model = await tf.loadLayersModel("/path/to/model.json");
			setModel(model);
		};

		loadModel();
	}, []);

	const predict = async () => {
		// TODO: Implement prediction using the loaded model
	};

	return (
		<div
			className={`flex flex-col gap-10 min-h-screen items-center justify-center p-24 ${inter.className}`}
		>
			<h1>Cat Detector</h1>
			<InputFile />
			{/* <Progress value={progress} className='w-[66%]' /> */}
			<Button onClick={predict}>Predict</Button>
		</div>
	);
}
