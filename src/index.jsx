import 'tachyons'
import './index.css'
import React, { useMemo, useState } from 'react'
import { render } from 'react-dom'
import faker from 'faker'
import nanoid from 'nanoid'
import * as R from 'ramda'

function invariant(bool, msg) {
  if (!bool) {
    throw new Error(msg || 'invariant failed')
  }
}

function createLine(options) {
  return {
    id: `I_${nanoid()}`,
    title: faker.name.lastName(),
  }
}

const findById = R.compose(
  R.find,
  R.propEq('id'),
)

const idEq = R.propEq('id')

function createLines() {
  return R.times(() => createLine())(10)
}

const trashLineById = R.curry(function(id, state) {
  const idx = R.findIndex(idEq(id))(state.lines)
  invariant(idx >= 0)
  return R.assocPath(['lines', idx, 'trashed'])(true)(state)
})

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

function App() {
  const [state, setState] = useState(() => ({
    lines: createLines(),
  }))

  const actions = useMemo(() => {
    return {
      lineDelClicked(line) {
        setState(trashLineById(line.id))
      },
    }
  }, [setState])

  const filteredLines = R.reject(R.propOr(false, 'trashed'))(state.lines)
  const renderLines = R.map(line => (
    <LineView line={line} actions={actions} />
  ))
  return <div className="sans-serif">{renderLines(filteredLines)}</div>
}

render(<App />, document.getElementById('root'))
