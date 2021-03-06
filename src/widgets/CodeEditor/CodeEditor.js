/**
 * Created by wcx73 on 2017/4/9.
 */
import React, {Component} from "react";
import "./CodeEditor.css";
import AceEditor from "./AceEditor/AceEditor";
import "brace/mode/java";
import "brace/mode/javascript";
import "brace/mode/python";
import "brace/theme/github";
import axios from "axios";

export default class CodeEditor extends Component {
    constructor(props) {
        super(props);
        this.id = 0;
        this.state = {output: '', code: "print 'hello world'"};
        this.codeEditor = <AceEditor
            ref={(editor) => {
                this.ref_editor = editor;
            }}
            mode="python"
            theme="github"
            name="codepad"
            height="calc(100vh - 270px)"
            width="100%"
            onChange={this.onChange.bind(this)}
            defaultValue="print 'hello world'"
        />;
        if (window["WebSocket"]) {
            this.conn = new WebSocket("ws://localhost:8080/ws");
            this.conn.onclose = function (event) {
            };
            this.conn.onmessage = function (event) {
                console.log("onmessage" + event.data);
                this.applyPatch(event.data);
            }.bind(this);
        }
    }

    applyPatch(patchText) {
        let patchJson = JSON.parse(patchText);
        let code = window.dmp.applyPatch(this.state.code, patchJson.data);
        this.setState({'code': code});
        console.log(this.ref_editor.editor.getCursorPosition());
        this.setCodeWithoutCallback(code);
        // if (patchJson.id === this.id) {
        //     console.log("local");
        //     console.log(patchJson.cursor);
        //     this.ref_editor.editor.moveCursorToPosition(patchJson.cursor);
        // }
    }

    submitPatch(patchText) {
        this.conn.send(patchText);
    }

    componentDidMount() {
    }

    onChange(newValue) {
        console.log(this.state.code, newValue);
        if (this.state.code !== newValue) {
            let patch = window.dmp.createDiffAndPatch(this.state.code, newValue);
            let d = JSON.stringify({
                'data': patch,
                'id': this.id,
                'cursor': this.ref_editor.editor.getCursorPosition()
            });
            console.log(d);
            this.setCodeWithoutCallback(this.state.code);
            this.submitPatch(d);
        }
    }

    setCodeWithoutCallback(code) {
        this.ref_editor.silent = true;
        let pos = this.ref_editor.editor.getCursorPosition();
        this.setCode(code);
        pos.column += 1;
        this.ref_editor.editor.moveCursorToPosition(pos);
        this.ref_editor.silent = false;
    }

    getCode() {
        return this.ref_editor.editor.getValue()
    }

    setCode(s) {
        this.ref_editor.editor.setValue(s, 1);
    }

    runProgram() {
        // this.ref_editor.editor.setValue(this.state['code'].toUpperCase(), 1);

        axios.get('http://localhost:3001/code?code=' + encodeURIComponent(this.state.code)).then(function (response) {
            this.setState({'output': response.data});
            console.log(this.state)
        }.bind(this)).catch(function (error) {
            //Some error occurred
            console.error('error', error);
        });
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-6">{this.codeEditor}</div>
                    <div className="col-md-6 output-area">{this.state.output}</div>
                </div>
                <div className="container-fluid">
                    <button className="btn btn-success " onClick={this.runProgram.bind(this)}>RUN</button>
                </div>
            </div>
        );
    }
}

