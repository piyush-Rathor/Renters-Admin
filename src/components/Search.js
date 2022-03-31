import React, { useCallback, useEffect, useState } from 'react'
import MiniSearch from 'minisearch'
import get from 'lodash/get'
import debounce from 'lodash/debounce'
import cloneDeep from 'lodash/cloneDeep'
import { InputBase } from '@material-ui/core'
import { fade, makeStyles } from '@material-ui/core/styles'
import { mdiMagnify } from '@mdi/js'

import { Icon } from './index'

const useStyles = makeStyles(theme => ({
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.background.paper, 0.5),
    '&:hover': {
      backgroundColor: fade(theme.palette.background.paper, 0.6),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '22ch'
      },
    },
  },
}))

function Search({ items, fields, query: incomingQuery, setQuery: setIncomingQuery, onChange }) {
  const classes = useStyles()

  const [query, setQuery] = useState('')
  const [search, setSearch] = useState(null)

  useEffect(() => {
    if (items) {
      let miniSearch = new MiniSearch({
        idField: '_id',
        fields: fields || ['name', '_supplier.name'],
        storeFields: ['_id'],
        searchOptions: { fuzzy: 0.2, prefix: true },
        extractField: get,
      })
      miniSearch.addAll(cloneDeep(items))
      setSearch(() => query => miniSearch.search(query))
    }
  }, [fields, items])

  const debouncedSearch = useCallback(
    debounce((query, cb) => {
      if (!query) return
      const results = search(query)
      cb && cb(results)
    }, 1000),
    [search]
  )

  useEffect(() => {
    const _query = setIncomingQuery ? incomingQuery : query
    if (!query) onChange(null)
    debouncedSearch(_query, results => {
      onChange(_query ? results.map(c => c._id).map(_id => items.filter(_c => _c._id === _id)[0]) : null)
    })
  }, [debouncedSearch, incomingQuery, items, onChange, query, setIncomingQuery])

  return (
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        <Icon path={mdiMagnify} />
      </div>
      <InputBase
        placeholder="Search…"
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        inputProps={{ 'aria-label': 'search' }}
        value={setIncomingQuery ? incomingQuery : query}
        onChange={e => {
          const query = e.target.value
          setIncomingQuery ? setIncomingQuery(query) : setQuery(query)
        }}
      />
    </div>
  )
}

export default Search
