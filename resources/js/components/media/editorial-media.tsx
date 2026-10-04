import Image from "@/components/media/image";

export function EditorialMedia({
    images,
    priority = false,
}: {
    images: { src: string; alt: string }[];
    priority?: boolean;
}) {
    if (!images.length) return null;

    return (
        <div className="editorial-media">
            {images.map((image, index) => (
                <Image
                    key={`${image.src}-${index}`}
                    src={image.src}
                    alt={image.alt}
                    preload={priority && index === 0}
                />
            ))}
        </div>
    );
}
