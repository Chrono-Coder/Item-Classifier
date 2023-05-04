import { Input } from "./input";
import { Label } from "./label";
import { ChangeEvent } from "react";

interface InputFileProps {
	image: ImageData | null | undefined;
	setImage: React.Dispatch<
		React.SetStateAction<ImageData | null | undefined>
	>;
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const InputFile = ({ image, setImage, onChange }: InputFileProps) => {
	return (
		<div className='grid w-full max-w-sm items-center gap-1.5'>
			<Label htmlFor='picture'>Picture</Label>
			<Input
				id='picture'
				type='file'
				className='p-2 border-none rounded-md bg-gradient-to-tl from-[#EB772B] to-[#ffad66] placeholder:text-white'
				onChange={(event: ChangeEvent<HTMLInputElement>) => {
					onChange?.(event);
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
