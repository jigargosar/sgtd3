import 'tachyons'
import './index.css'
import React from 'react'
import { render } from 'react-dom'
import faker from 'faker'
import nanoid from 'nanoid'

function createLine(options) {
  return {
    id: `I_${nanoid()}`,
    title: faker.name.lastName(),
  }
}

function App() {
  const line = createLine()
  return (
    <div className="sans-serif">
      <div>HW</div>
      <div>{line.id}</div>
      <div>{line.title}</div>
    </div>
  )
}

render(<App />, document.getElementById('root'))
