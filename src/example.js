(() => {
  async function sleep(value, ms) {
    return new Promise((res) => {
      setTimeout(res, ms, value);
    })
  }

  async function* iterate(values) {
    for (const item of values) {
      yield sleep(item, 1000);
    }
  }

  return {
    foo: iterate(['one', 'two', 'three']),
    bar: iterate(['uno', 'dos', 'tres']),
    baz: iterate(['un', 'deux', 'trois']),
  };
})()
