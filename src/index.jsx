import 'tachyons'
import './index.css'
import React, { useMemo } from 'react'
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

function LineView({ line, actions }) {
  return (
    <div className="pa2 code f6">
      <div className="flex items-center">
        <div>Item</div>
        <button
          className="mh2"
          onClick={() => actions.lineDelClicked(line)}
        >
          DEL
        </button>
      </div>
      <div>Id:{line.id}</div>
      <div>Title:{line.title}</div>
    </div>
  )
}

const findById = R.compose(
  R.find,
  R.propEq('id'),
)

function App() {
  const line = createLine()
  const lines = R.times(() => createLine())(10)

  const actions = useMemo(() => {
    return {
      lineDelClicked(line) {
        const foundLine = findById(line.id)(lines)
        console.log(foundLine)
      },
    }
  })

  return (
    <div className="sans-serif">
      {R.map(line => <LineView line={line} actions={actions} />)(lines)}
    </div>
  )
}

render(<App />, document.getElementById('root'))
