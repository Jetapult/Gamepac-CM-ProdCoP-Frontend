// import Image from "next/image";
import Image from "../assets/image.png";

const Brand = ({ imgSrc, imgAlt }) => (
  <Image src={imgSrc} alt={imgAlt} width="258" height="65" />
);

export default Brand;
