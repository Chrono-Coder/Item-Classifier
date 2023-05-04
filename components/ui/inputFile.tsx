import { Input } from "./input";
import { Label } from "./label";
import { ChangeEvent } from "react";

interface InputFileProps {
	image: ImageData | null;
	setImage: React.Dispatch<React.SetStateAction<ImageData | null>>;
}

export const InputFile = ({ image, setImage }: InputFileProps) => {
	return (
		<div className='grid w-full max-w-sm items-center gap-1.5'>
			<Label htmlFor='picture'>Picture</Label>
			<Input
				id='picture'
				type='file'
				onChange={(event: ChangeEvent<HTMLInputElement>) => {
					const file = event?.target.files?.[0];
					if (file) {
						const reader = new FileReader();
						reader.onload = () => {
							const image = new Image();
							image.onload = () => {
								const canvas = document.createElement("canvas");
								const context = canvas.getContext("2d");
								if (context) {
									canvas.width = image.width;
									canvas.height = image.height;
									context.drawImage(image, 0, 0);
									const imageData = context.getImageData(
										0,
										0,
										image.width,
										image.height
									);
									setImage(imageData);
								}
							};
							image.src = reader.result as string;
						};
						reader.readAsDataURL(file);
					}
				}}
			/>
		</div>
	);
};
