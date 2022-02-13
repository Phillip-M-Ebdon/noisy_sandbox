
// permutations ranges from 0 to 255, twice for wrapping
// used for pseudo random values in algorithms like Perlin and Simplex noise
export class Permutation {
    constructor() {
        this.permutations = [];
        for (let i = 0; i < 256; i++) {
            this.permutations.push(i);
            this.permutations.push(i);
        }
        this.shuffle();
    }

    shuffle() {
        for (let i = 0; i < 512; i++) {
            let newIndex = Math.floor(Math.random() * 512);
            let saved = this.permutations[i];
            this.permutations[i] = this.permutations[newIndex];
            this.permutations[newIndex] = saved;
        }
    }

    get(i) {
        return this.permutations[i];
    }

    get2(x, y) {
        return this.permutations[this.permutations[x] + y];
    }

    get3(x, y, z) {
        return this.permutations[this.permutations[this.permutations[x] + y] + z]; 
    }

    getN(offsets){
        if (offsets.length < 0) {
            throw new Error("input should have one or more integer elements")
        }
        try {
            let value = this.permutations[offsets[0]];
            let index = 1 
            while (index < offsets.length) {
                value = this.permutations[value + offsets[index]]
                index++
            }
        } catch(e) {
            console.error(e)
        }

        return value;
    }

}