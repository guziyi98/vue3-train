const person = {
  name: 'gzy',
  get aliasName () {
    return '**' + this.name + '**'
  }
}
console.log(person.aliasName)