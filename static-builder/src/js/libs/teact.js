function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ? child : createTextElement(child),
      ),
    },
  }
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

const svgTag = ['svg', 'path', 'text', 'rect']

function createDom(fiber) {
  const isSvg = svgTag.includes(fiber.type)
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode(fiber.props.nodeValue || '')
      : isSvg
        ? document.createElementNS('http://www.w3.org/2000/svg', fiber.type)
        : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props, isSvg)

  return dom
}

const isEvent = key => key.startsWith('on')
const isProperty = key =>
  key !== 'children' && key !== 'className' && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO fix
function updateDom(dom, prevProps = {}, nextProps = {}) {
  const isSvg = dom instanceof SVGElement

  // Remove old or changed event listeners
  for (const name of Object.keys(prevProps)) {
    if (isEvent(name)) {
      const eventType = name.toLowerCase().substring(2)
      dom.removeEventListener(eventType, prevProps[name])
    }
  }

  // Add new event listeners
  for (const name of Object.keys(nextProps)) {
    if (isEvent(name) && isNew(prevProps, nextProps)(name)) {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[name])
    }
  }

  // Remove old properties
  for (const name of Object.keys(nextProps)) {
    if (isEvent(name)) {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[name])
    }
  }

  // Set new or changed properties
  for (const name of Object.keys(nextProps)) {
    if (isProperty(name) && isNew(prevProps, nextProps)(name)) {
      if (isSvg) {
        dom.setAttribute(name, nextProps[name])
      } else {
        dom[name] = nextProps[name]
      }
    }
  }

  // handle className specifically
  if (!isSvg && prevProps.className !== nextProps.className) {
    dom.className = nextProps.className || ''
  }
}

function commitRoot() {
  deletions.forEach(commitWork)
  currentRoot = wipRoot
  commitWork(wipRoot.child)
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }

  let domParentFiber = fiber.parent
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }

  const domParent = domParentFiber.dom

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent)
    return
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)

  if (fiber.effects) {
    for (const effect of fiber.effects) {
      effect()
    }
  }
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  }
  deletions = []
  nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
let deletions = null

function workLoop(deadline) {
  let shouldYield = false

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)

    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  // return next unit of work
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

let wipFiber = null
let hookIndex = null

function updateFunctionComponent(fiber) {
  wipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []
  wipFiber.effects = []
  // NOTE: 関数コンポーネントは関数を実行して返されたコンポーネントをfiberに格納する
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  // fiber.propsが存在し、childrenが存在するかを確認
  const elements = fiber.props?.children || []
  reconcileChildren(fiber, elements)
}

function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber = wipFiber.alternate?.child
  let prevSibling = null

  const isSvg = wipFiber.isSvg

  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    let newFiber = null

    const sameType = oldFiber && element && element.type === oldFiber.type
    // oldFiber and element are the same type. update the node
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
        isSvg,
      }
    }
    // oldFiber and element are different types. add the new node
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
        isSvg,
      }
    }
    // oldFiber exists but element does not. delete the old node
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }

    oldFiber = oldFiber?.sibling

    if (index === 0) {
      wipFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

function useState(initial) {
  const oldHook = wipFiber.alternate?.hooks?.[hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  const actions = oldHook ? oldHook.queue : []
  for (const action of actions) {
    hook.state = action(hook.state)
  }

  const setState = action => {
    if (action instanceof Function) {
      hook.queue.push(action)
    } else {
      hook.queue.push(() => action)
    }
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}

function useEffect(callback, deps) {
  const oldHook = wipFiber.alternate?.hooks?.[hookIndex]
  const hook = {
    deps,
    cleanup: null,
  }

  const hasChanged =
    !oldHook?.deps || oldHook.deps.some((dep, index) => dep !== deps[index])

  if (hasChanged) {
    if (oldHook && typeof oldHook.cleanup === 'function') {
      wipFiber.effects.push(() => {
        oldHook.cleanup()
        const cleanup = callback()
        if (typeof cleanup === 'function') {
          hook.cleanup = cleanup
        }
      })
    } else {
      wipFiber.effects.push(() => {
        const cleanup = callback()
        if (typeof cleanup === 'function') {
          hook.cleanup = cleanup
        }
      })
    }
  } else {
    hook.cleanup = oldHook.cleanup
  }

  wipFiber.hooks.push(hook)
  hookIndex++
}

function useCallback(callback, deps) {
  const oldDeps = wipFiber.alternate?.hooks?.[hookIndex]?.deps
  const hook = {
    callback,
    deps,
  }

  const hasChanged =
    !oldDeps || oldDeps.some((dep, index) => dep !== deps[index])
  if (hasChanged) {
    hook.callback = callback
    hook.deps = deps
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  return hook.callback
}

export const Teact = {
  createElement,
  render,
  useState,
  useCallback,
  useEffect,
}
