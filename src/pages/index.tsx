import Image from "next/image";
import { Inter } from "next/font/google";
import { Loader2 } from "lucide-react";
const inter = Inter({ subsets: ["latin"] });
import { InputFile } from "@/../components/ui/inputFile";
import { useEffect, useState, useRef, useMemo } from "react";
import * as tf from "@tensorflow/tfjs";
import Peanut from "@/../public/logo.png";
type ModelType = tf.LayersModel | null;

export default function Home() {
	// const [progress, setProgress] = useState(13);
	const modelRef = useRef<ModelType>();
	const [image, setImage] = useState<ImageData | null>(null);
	const [predicting, setPredicting] = useState(false);
	const [prediction, setPrediction] = useState<string | null>(null);
	const [dataURL, setDataURL] = useState<string | undefined>(undefined);

	const classes = useMemo(
		() => ["Bengal", "Main Coon", "Persian", "Scottish Fold", "Siamese"],
		[]
	);
	useEffect(() => {
		const loadModel = async () => {
			try {
				const modal = await tf.loadLayersModel("/models/model.json");
				modelRef.current = modal;
			} catch (err) {
				console.log(err);
			}
		};

		loadModel();
	}, []);

	const predict = async () => {
		setPredicting(true);
		const tensor = tf.browser
			.fromPixels(image as ImageData)
			.resizeNearestNeighbor([125, 125])
			.div(tf.scalar(255))
			.toFloat()
			.expandDims();
		const predictions = (await modelRef.current?.predict(
			tensor
		)) as tf.Tensor;
		let pred = predictions.arraySync() as Array<Array<number>>;
		let maxIndex = pred[0].indexOf(Math.max(...pred[0]));
		setTimeout(() => {
			setPrediction(classes[maxIndex]);
			setPredicting(false);
		}, 1000);
	};

	useEffect(() => {
		setPrediction(null);
	}, [image]);

	useEffect(() => {
		// Convert the image data to a data URL
		if (!image) return;
		const canvas = document.createElement("canvas");
		canvas.width = image.width;
		canvas.height = image.height;
		const context = canvas.getContext("2d");
		context?.putImageData(image, 0, 0);
		const dataURL = canvas.toDataURL();
		setDataURL(dataURL);
	}, [image]);

	useEffect(() => {
		if (dataURL) predict();
	}, [dataURL]);

	return (
		<div
			className={`bg-[#171A2C] flex flex-col gap-10 h-screen w-screen items-center justify-center py-24 px-7  ${inter.className}`}
		>
			<h1 className='text-5xl font-bold text-center text-[#C9CAD5] fixed top-8 '>
				Cat Predictor
			</h1>

			{image ? (
				<div className='relative w-full h-[60%] mt-10'>
					<Image
						src={dataURL as string}
						fill
						className='shadow-sm rounded-2xl shadow-black'
						style={{ objectFit: "cover" }}
						alt='cat'
					/>
				</div>
			) : (
				<div className='relative w-full h-[60%] mt-10'>
					<Image
						src={Peanut}
						fill
						className='shadow-sm rounded-2xl shadow-black'
						style={{
							objectFit: "cover",
							objectPosition: "center",
						}}
						alt='cat'
					/>
				</div>
			)}
			<div className='flex flex-col w-full h-full gap-10 px-16 my-auto'>
				{(prediction || predicting) && (
					<h1 className='p-0 m-0 font-medium text-center text-3xl text-[#C9CAD5]'>
						{predicting ? (
							<div className='flex justify-center gap-5'>
								{" "}
								<Loader2 className='w-7 h-7 animate-spin text-center text-[#C9CAD5]' />
								{/* Calculating */}
							</div>
						) : (
							prediction
						)}
					</h1>
				)}
				<InputFile
					image={image}
					setImage={setImage}
					// onChange={() => {
					// 	;
					// }}
				/>

				{/* <Button
					disabled={predicting}
					className='text-black bg-gradient-to-tr from-[#EB772B] to-[#ffad66] hover:scale-[101%] ease-in-out duration-100 transition-all hover:bg-[#EB772B] hover:bg-opacity-90 rounded-full'
					onClick={() => image && predict()}
				>
					{predicting ? (
						<>
							{" "}
							<Loader2 className='w-4 h-4 mr-2 animate-spin' />
							Calculating
						</>
					) : (
						"Predict"
					)}
				</Button> */}
			</div>
		</div>
	);
}
