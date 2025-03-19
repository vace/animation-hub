export interface PropDeclaration {
  property: string
  value: string
}

export interface PropKeyframe {
  name: string
  declarations: PropDeclaration[]
}

export interface AnimationSelector {
  type: 'selector'
  animation: string
  selectors: string[]
  declarations: PropDeclaration[]
}

export interface AnimationKeyframes {
  type: 'keyframes'
  name: string
  keyframes: PropKeyframe[]
}

export interface Animation {
  name: string
  categories: string[]
  keyframes: PropKeyframe[]
  properties?: PropDeclaration[]
}

export interface AnimationGroup {
  name: string
  animations: Animation[]
  selectors: AnimationSelector[]
  template?: string
}
