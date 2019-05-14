import 'tachyons'
import './index.css'
import React from 'react'
import { render } from 'react-dom'
import faker from 'faker'
import nanoid from 'nanoid'
import * as R from 'ramda'

function createLine(options) {
  return {
    id: `I_${nanoid()}`,
    title: faker.name.lastName(),
  }
}

function LineView({ line }) {
  return (
    <div className="pa2 code f6">
      <div>Item</div>
      <div>Id:{line.id}</div>
      <div>Title:{line.title}</div>
    </div>
  )
}

function App() {
  const line = createLine()
  const lines = R.times(() => createLine())(10)
  return (
    <div className="sans-serif">
      {R.map(line => <LineView line={line} />)(lines)}
    </div>
  )
}

render(<App />, document.getElementById('root'))
