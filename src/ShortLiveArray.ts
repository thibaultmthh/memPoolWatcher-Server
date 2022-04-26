// Array of unique values
// Values only live 3 seconds after creation

export class ShortLiveArray<T> extends Array<T> {
  history: number[] = [];
  lifespan: number;
  i: number;

  constructor(lifespan: number = 3) {
    super();
    this.lifespan = lifespan * 10;
    this.i = 0;
    this.history = new Array(this.lifespan).fill(0);

    setInterval(() => {
      this.i = this.nextIndex();
      const nb = this.history[this.nextNexIndex()];
      for (let i = 0; i < nb; i++) {
        this.shift();
      }
      this.history[this.nextNexIndex()] = 0;
    }, 100);
  }

  nextIndex(): number {
    return (this.i + 1) % this.lifespan;
  }

  nextNexIndex(): number {
    return (this.i + 2) % this.lifespan;
  }

  push(...items: T[]): number {
    const itemsFiltered = items.filter((item) => !this.includes(item));
    super.push(...itemsFiltered);
    this.history[this.nextIndex()] += itemsFiltered.length;
    return itemsFiltered.length;
  }
}
