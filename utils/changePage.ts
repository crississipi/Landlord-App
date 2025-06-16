export function changePage(page: number): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(page); // return the number asynchronously
    }, 50);
  });
}