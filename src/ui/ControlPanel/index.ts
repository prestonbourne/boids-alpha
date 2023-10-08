import './styles.module.css'

export class ControlPanelView {
    private node: HTMLElement
    constructor(){
        const appRoot = document.getElementById('app')
        if(!appRoot) throw ReferenceError('Could not find HTML element with id `#app`')

        this.node = document.createElement('aside')
        this.node.classList.add('ControlPanel')
        appRoot.appendChild(this.node)
    }
}