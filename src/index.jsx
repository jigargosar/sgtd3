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

const idxById = R.curry(function(id, arr) {
  return R.findIndex(idEq(id), arr)
})

const Collection = {
  named: R.curry(function(name) {
    return {
      name,
      items: [],
    }
  }),
  replaceAll: R.curry(function(items, collection) {
    return R.assoc('items')(items)(collection)
  }),
  filter: R.curry(function(pred, collection) {
    return R.filter(pred)(collection.items)
  }),
  reject: R.curry(function(pred, collection) {
    return R.reject(pred)(collection.items)
  }),
  byId: R.curry(function(id, collection) {
    return R.find(idEq(id))(collection.items)
  }),
  updateById: R.curry(function(id, fn, collection) {
    const idx = idxById(id, collection.items)
    invariant(idx >= 0)
    return R.over(R.lensPath(['items', idx]))(fn)(collection)
  }),
  update: R.curry(function(operation, collection) {
    const mapJournal = fn =>
      R.over(R.lensProp('journal'))(
        R.pipe(
          R.defaultTo([]),
          fn,
        ),
      )

    const appendOper = oper => c => {
      const compressOrAppend = j => {
        const last = R.last(j)
        const eqByIdPath = R.eqBy(R.pick(['id', 'path']))
        const tsOf = R.propOr(0, 'at')
        const tsDiff = tsOf(oper) - tsOf(last)
        if (
          tsDiff < 3000 &&
          eqByIdPath(oper, last) &&
          R.equals(last.to, oper.from)
        ) {
          const modOpr = R.assoc('from')(last.to)(oper)
          return R.compose(
            R.append(modOpr),
            R.drop(1),
          )(j)
        }
        return R.append(oper, j)
      }

      // debugger
      return mapJournal(
        R.pipe(
          v => {
            // debugger
            return v
          },
          R.ifElse(R.isEmpty, R.append(oper), compressOrAppend),
          R.take(100),
        ),
      )(c)
    }
    const updateItems = oper => {
      const { id, path, from, to } = oper
      return Collection.updateById(id, item => {
        invariant(R.pathEq(path, from, item))
        return R.assocPath(path, to, item)
      })
    }

    const fn = R.pipe(
      v => {
        // debugger
        return v
      },
      appendOper(operation),
      v => {
        // debugger
        return v
      },
      updateItems(operation),
      v => {
        // debugger
        return v
      },
    )

    return fn(collection)
  }),
}

function createLine() {
  return {
    id: `I_${nanoid()}`,
    title: faker.name.lastName(),
  }
}

function createLines() {
  return R.times(() => createLine())(10)
}

function createLinesCollection() {
  const lineC = Collection.named('Lines')
  return Collection.replaceAll(createLines(), lineC)
}

function loadState() {
  const parsed = JSON.parse(localStorage.getItem('sgtd3-state') || '{}')

  return R.mergeDeepRight({
    lines: createLines(),
    linesC: createLinesCollection(),
  })(parsed)
}

function cacheState(state) {
  localStorage.setItem('sgtd3-state', JSON.stringify(state))
}

const overItemsC = R.over(R.lensPath(['linesC']))

const updateItemById = R.curry(function(id, fn, state) {
  return overItemsC(Collection.updateById(id, fn))(state)
})
const trashLineById = R.curry(function(id, state) {
  return updateItemById(id, R.assoc('trashed')(true))(state)
})

const unTrashLineById = R.curry(function(id, state) {
  return updateItemById(id, R.assoc('trashed')(false))(state)
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
      onTitleChanged(title, line) {
        const fn = Collection.update({
          id: line.id,
          path: ['title'],
          from: line.title,
          to: title,
          at: Date.now(),
        })
        setState(overItemsC(fn))
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

  function renderPage() {
    if (page.kind === 'MAIN_PAGE') {
      return renderMainPage(state, actions)
    } else if (page.kind === 'LINE_DETAIL') {
      return renderLineDetailPage(actions, state)
    }
  }

  const j = state.linesC.journal

  return (
    <div>
      <div>
        <div>DEBUG</div>
        <div>Journal Ct: {j.length}</div>
      </div>
      {renderPage()}
    </div>
  )
}

function renderLineDetailPage(actions, state) {
  const page = state.page
  const id = page.id
  const line = Collection.byId(id, state.linesC)
  return (
    <div>
      <button onClick={() => actions.onBackClicked()}>Back</button>
      <div>DETAIL:</div>
      <div>ID: {line.id}</div>
      <label>
        Title:
        <input
          autoFocus
          type="text"
          value={line.title}
          onChange={e => actions.onTitleChanged(e.target.value, line)}
        />
      </label>
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

function renderMainPage(state, actions) {
  const trashedLines = Collection.filter(isTrashed)(state.linesC)
  const trashCt = trashedLines.length
  const filteredLines = Collection.reject(isTrashed)(state.linesC)
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
          ALL: {filteredCt}
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
  const trashBtn = line.trashed ? (
    <button
      className="mh2"
      onClick={() => actions.lineLiRestoreClicked(line)}
    >
      RESTORE
    </button>
  ) : (
    <button className="mh2" onClick={() => actions.lineLiDelClicked(line)}>
      DEL
    </button>
  )
  return (
    <div className="pa2 code f5">
      <div className="flex items-center">
        {/* <div>Item</div> */}
        {false && trashBtn}
      </div>
      <div
        className="pointer hover-dark-blue"
        onClick={() => actions.onLineLITitleClicked(line)}
      >
        <div>{line.title}</div>
        <div className="f7 o-70">id: {line.id}</div>
      </div>
    </div>
  )
}

//#endregion

render(<App />, document.getElementById('root'))
