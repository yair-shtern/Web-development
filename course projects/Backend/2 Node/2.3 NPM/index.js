// import generateName from "sillyname";
// var sillyName = generateName();


// console.log(`My name is ${sillyName}.`);

import superheroes from 'superheroes';
const mySuperheroName = superheroes[Math.floor(Math.random() * superheroes.length)];
console.log(`I am ${mySuperheroName}!`);