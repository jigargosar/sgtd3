import 'tachyons'
import './index.css'
import React, { useMemo, useState, useEffect } from 'react'
import { render } from 'react-dom'
import faker from 'faker'
import nanoid from 'nanoid'
import * as R from 'ramda'

function invariant(bool, msg) {
  if (!bool) {
    throw new Error(msg || 'invariant failed')
  }
}

const idEq = R.propEq('id')
const isTrashed = R.propOr(false, 'trashed')

function createLine() {
  return {
    id: `I_${nanoid()}`,
    title: faker.name.lastName(),
  }
}

function createLines() {
  return R.times(() => createLine())(10)
}

function loadState() {
  const parsed = JSON.parse(localStorage.getItem('sgtd3-state') || '{}')

  return R.mergeDeepRight({ lines: createLines() })(parsed)
}

function cacheState(state) {
  localStorage.setItem('sgtd3-state', JSON.stringify(state))
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
  const [state, setState] = useState(loadState)
  useEffect(() => cacheState(state), [state])

  const actions = useMemo(() => {
    return {
      lineDelClicked(line) {
        setState(trashLineById(line.id))
      },
      onTabClicked(name) {
        setState(R.assoc('currentTab')(name))
      },
    }
  }, [setState])

  const trashedLines = R.filter(isTrashed)(state.lines)
  const trashCt = trashedLines.length
  const filteredLines = R.reject(isTrashed)(state.lines)
  const filteredCt = filteredLines.length
  const renderLines = R.map(line => (
    <LineView key={line.id} line={line} actions={actions} />
  ))

  const selectedTab = R.propOr('ALL', 'currentTab')(state)

  const selTabCN = 'bg-black white'
  return (
    <div className="sans-serif">
      <div className="pa2 flex">
        <div
          className={`pa2 ${selectedTab === 'ALL' ? selTabCN : ''}`}
          onClick={() => actions.onTabClicked('ALL')}
        >
          ALL: {filteredCt}
        </div>
        <div
          className={`pa2 ${selectedTab === 'TRASH' ? selTabCN : ''}`}
          onClick={() => actions.onTabClicked('TRASH')}
        >
          Trashed: {trashCt}
        </div>
      </div>
      <hr />
      {selectedTab === 'ALL' && renderLines(filteredLines)}
      {selectedTab === 'TRASH' && renderLines(trashedLines)}
    </div>
  )
}

render(<App />, document.getElementById('root'))
