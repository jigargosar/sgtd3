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

const unTrashLineById = R.curry(function(id, state) {
  const idx = R.findIndex(idEq(id))(state.lines)
  invariant(idx >= 0)
  return R.assocPath(['lines', idx, 'trashed'])(false)(state)
})

const toMainPage = R.assoc('page')({ kind: 'MAIN_PAGE' })

function useActions(setState) {
  return useMemo(() => {
    return {
      lineLiDelClicked(line) {
        setState(trashLineById(line.id))
      },
      lineDetailDelClicked(line) {
        setState(
          R.pipe(
            //
            trashLineById(line.id),
            toMainPage,
          ),
        )
      },
      lineDetailRestoreClicked(line) {
        setState(
          R.pipe(
            //
            unTrashLineById(line.id),
            toMainPage,
          ),
        )
      },
      lineLiRestoreClicked(line) {
        setState(unTrashLineById(line.id))
      },
      onTabClicked(name) {
        setState(R.assoc('currentTab')(name))
      },
      onLineLITitleClicked(line) {
        setState(R.assoc('page')({ kind: 'LINE_DETAIL', id: line.id }))
      },
      onBackClicked() {
        setState(toMainPage)
      },
    }
  }, [setState])
}

//#region RENDER

function App() {
  const [state, setState] = useState(loadState)
  useEffect(() => cacheState(state), [state])

  const actions = useActions(setState)

  const page = R.propOr({ kind: 'MAIN_PAGE' }, 'page')(state)

  if (page.kind === 'MAIN_PAGE') {
    return renderMainPage(state, actions)
  } else if (page.kind === 'LINE_DETAIL') {
    const id = page.id
    const line = R.find(idEq(id))(state.lines)
    return (
      <div>
        <button onClick={() => actions.onBackClicked()}>Back</button>
        <div>DETAIL:</div>
        <div>ID: {line.id}</div>
        <div>Title: {line.title}</div>
        <div className="flex">
          {line.trashed ? (
            <button onClick={() => actions.lineDetailRestoreClicked(line)}>
              RESTORE
            </button>
          ) : (
            <button onClick={() => actions.lineDetailDelClicked(line)}>
              DEL
            </button>
          )}
        </div>
      </div>
    )
  }
}

function renderMainPage(state, actions) {
  const trashedLines = R.filter(isTrashed)(state.lines)
  const trashCt = trashedLines.length
  const filteredLines = R.reject(isTrashed)(state.lines)
  const filteredCt = filteredLines.length
  const renderLines = R.map(line => (
    <LineLI key={line.id} line={line} actions={actions} />
  ))
  const tabNames = ['ALL_TAB', 'TRASH_TAB']
  const selectedTab = R.propOr('ALL_TAB', 'currentTab')(state)
  invariant(tabNames.includes(selectedTab))
  const selTabCN = 'bg-black white'
  return (
    <div className="sans-serif">
      <div className="pa2 flex">
        <div
          className={`pa2 ${selectedTab === 'ALL_TAB' ? selTabCN : ''}`}
          onClick={() => actions.onTabClicked('ALL_TAB')}
        >
          ALL_TAB: {filteredCt}
        </div>
        <div
          className={`pa2 ${selectedTab === 'TRASH_TAB' ? selTabCN : ''}`}
          onClick={() => actions.onTabClicked('TRASH_TAB')}
        >
          Trashed: {trashCt}
        </div>
      </div>
      <hr />
      {selectedTab === 'ALL_TAB' && renderLines(filteredLines)}
      {selectedTab === 'TRASH_TAB' && renderLines(trashedLines)}
    </div>
  )
}

function LineLI({ line, actions }) {
  return (
    <div className="pa2 code f6">
      <div className="flex items-center">
        <div>Item</div>
        {line.trashed ? (
          <button
            className="mh2"
            onClick={() => actions.lineLiRestoreClicked(line)}
          >
            RESTORE
          </button>
        ) : (
          <button
            className="mh2"
            onClick={() => actions.lineLiDelClicked(line)}
          >
            DEL
          </button>
        )}
      </div>
      <div>Id:{line.id}</div>
      <div onClick={() => actions.onLineLITitleClicked(line)}>
        Title:{line.title}
      </div>
    </div>
  )
}

//#endregion

render(<App />, document.getElementById('root'))
