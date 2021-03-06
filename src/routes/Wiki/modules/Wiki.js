export const RECEIVE_QUESTION = 'Wiki.RECEIVE_QUESTION'
export const GET_QUESTION = 'Wiki.GET_QUESTION'
export const UPDATE_REPLIES = 'Wiki.UPDATE_REPLIES'
export const RECEIVE_TAGS = 'Wiki.RECEIVE_TAGS'
export const GET_TAGS = 'Wiki.GET_TAGS'
const dataHost = __DATAHOST__

function receiveQuestion (data) {
  return {
    type: RECEIVE_QUESTION,
    data
  }
}

function updateReplies (id, data) {
  return {
    type: UPDATE_REPLIES,
    id,
    data
  }
}

function receiveTags (data) {
  return {
    type: RECEIVE_TAGS,
    data
  }
}

export function getTags () {
  return (dispatch) => {
    fetch(`${dataHost}/tags/_search`)
      .then(function (res) {
        if (res.status >= 400) {
          alert(`Error Status: ${res.status}`)
          throw new Error('Fetch fail')
        }
        return res.json()
      })
      .then(function (json) {
        return dispatch(receiveTags(json))
      })
  }
}

function getCountOfReplies (id) {
  return (dispatch) => {
    fetch(`${dataHost}/answer/_count?q=qId:${id}`)
      .then(function (res) {
        if (res.status >= 400) {
          console.log(`Error Status: ${res.status}`)
          throw new Error('Fetch fail')
        }
        return res.json()
      })
      .then(function (json) {
        return dispatch(updateReplies(id, json))
      })
  }
}

export function getQuestion (query) {
  return (dispatch) => {
    fetch(`${dataHost}/question/_search`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    })
      .then(function (res) {
        if (res.status >= 400) {
          alert(`Error Status: ${res.status}`)
          throw new Error('Fetch fail')
        }
        return res.json()
      })
      .then(function (json) {
        json.hits.hits.map((q) => {
          dispatch(getCountOfReplies(q._id))
        })
        dispatch(getTags())
        return dispatch(receiveQuestion(json))
      })
  }
}

export const actions = {
  getQuestion
}

const ACTION_HANDLERS = {
  [RECEIVE_QUESTION]: (state, action) => {
    return Object.assign({}, state, {
      ql: action.data
    })
  },
  [UPDATE_REPLIES]: (state, action) => {
    state.ql.hits.hits.map((q) => {
      if (q._id === action.id) {
        q._source.replies = action.data.count
      }
    })
    return Object.assign({}, state, {})
  },
  [RECEIVE_TAGS]: (state, action) => {
    return Object.assign({}, state, {
      tags: action.data.hits.hits
    })
  }
}

const initialState = {}
export default function counterReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
