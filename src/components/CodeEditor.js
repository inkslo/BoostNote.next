import React, { PropTypes } from 'react'
import styled from 'styled-components'
import CodeMirror from 'codemirror'
import _ from 'lodash'
import { Map } from 'immutable'

let docMap = new Map()

const Root = styled.div`
  .CodeMirror {
    min-height: 100%;
    font-family: 12px Consolas, "Liberation Mono", Menlo, Courier, monospace;
  }
`

class CodeEditor extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }

  componentDidMount () {
    const { value, docKey } = this.props
    this.value = value
    this.codemirror = CodeMirror(this.root, {
      value: _.isString(value) ? value : '',
      lineNumbers: true,
      lineWrapping: true,
      keyMap: 'sublime',
      inputStyle: 'textarea'
    })

    this.codemirror.on('blur', this.handleBlur)
    this.codemirror.on('change', this.handleChange)
    docMap = docMap.set(docKey, this.codemirror.getDoc())
  }

  componentWillUnmount () {
    this.codemirror.off('blur', this.handleBlur)
    this.codemirror.off('change', this.handleChange)
  }

  componentWillReceiveProps (nextProps) {
    // Swap doc when docKey changed to isolate undo history between notes
    if (this.props.docKey !== nextProps.docKey) {
      let nextDoc = docMap.get(nextProps.docKey)

      if (nextDoc == null) {
        nextDoc = new CodeMirror.Doc(nextProps.value)
        docMap = docMap.set(nextProps.docKey, nextDoc)
      }
      this.codemirror.swapDoc(nextDoc)
    }
  }

  componentDidUpdate () {
    if (this.props.value !== this.value) {
      this.value = this.props.value
      this.codemirror.off('change', this.handleChange)
      this.codemirror.setValue(this.props.value)
      this.codemirror.on('change', this.handleChange)
    }
  }

  handleBlur = (cm, e) => {
    if (e == null) return null
    let el = e.relatedTarget
    while (el != null) {
      if (el === this.root) {
        return
      }
      el = el.parentNode
    }

    if (this.props.onBlur != null) this.props.onBlur()
  }

  handleChange = e => {
    this.value = this.codemirror.getValue()
    if (this.props.onChange != null) this.props.onChange()
  }

  focus () {
    this.codemirror.focus()
  }

  render () {
    const { className, style } = this.props
    return (
      <Root
        className={className}
        style={style}
        innerRef={c => (this.root = c)}
      />
    )
  }
}

CodeEditor.propTypes = {
  value: PropTypes.string,
  docKey: PropTypes.string
}

export default CodeEditor
