import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/main.js';
import TestRunner from './test-runner/runner';
import ShortcutProcessor from './keyboard-shortcut/shortcut-processor';
import Editor from './editor';

export default class MainController {

  constructor(domNode, config) {
    this._domNode = domNode;
    this._config = config;
  }


  render() {
    this._editorDomNodeId = 'editorId';
    this._runnerDomNodeId = 'runnerId';
    this._render();
    this._editor = new Editor(this._editorDomNodeId);
    this._runner = new TestRunner(document.getElementById(this._runnerDomNodeId));
    this._runner.render(this._config.iframeSrcUrl);
    this.setEditorContent('');
    this._registerShortcuts(this._config.shortcuts);
  }

  _render(shortcuts=[]) {
    var props = {
      metaKeySymbol: '⌘',
      editorId: this._editorDomNodeId,
      runnerId: this._runnerDomNodeId,
      onSave: this.onSave.bind(this),
      onResetCode: this._onResetCode,
      shortcuts: shortcuts,
      es6Katas: this._es6Katas || null
    };
    ReactDOM.render(<Main {...props}/>, document.querySelector('#tddbin'));
  }

  showEs6KatasNavigation(es6KataData) {
    this._es6Katas = es6KataData;
    this._render();
    this._editor.resize(); // adding the katas navigation changes the space ACE can use, we must inform it to resize :/
  }

  onSave() {
    try {
      window.localStorage.setItem('code', this._editor.getContent());
    } catch (e) {
      // ignore it
    }
    this.runEditorContent();
  }

  _onResetCode() {
    window.localStorage.removeItem('code');
    window.location.reload();
  }

  setEditorContent(sourceCode) {
    this._editor.setContent(sourceCode);
  }

  runEditorContent() {
    this._runner.send(this._editor.getContent());
  }

  _registerShortcuts(shortcuts) {
    var processor = new ShortcutProcessor();
    processor.registerShortcuts(shortcuts);
    processor.onKeyDown(this._updateOverlayView.bind(this));
    processor.onShortcutEnd(this._hideOverlayView.bind(this));
  }

  _hideOverlayView() {
    this._render([]);
  }

  _updateOverlayView(pressedKeys) {
    var allShortcuts = this._config.shortcuts;
    var applicableShortcuts = allShortcuts.filter(function(shortcut) {
      return shortcut.isStartOfKeyCombo(pressedKeys);
    });
    this._render(applicableShortcuts);
  }

}
