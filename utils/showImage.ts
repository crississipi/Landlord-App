export function showImage(show: boolean, setImage: (img: boolean) => void){
  setTimeout(() => {
    setImage(show);
  }, 100);
}