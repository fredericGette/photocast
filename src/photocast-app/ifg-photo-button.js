import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

/**
 * Abstract Action
 * An event "ifg-action-execute" is thrown when the user selects this action.
 */
export class IFGPhotoButton extends PolymerElement {
    static get template() {
        return html`
        <style>
        .photo-button {
            display: flex;
            flex-direction: column;
            position: relative;
            background-color: DarkSlateBlue;
            height: 240px;
            width: 320px;
            border: 1vh solid black;
        }
        .photo-header {
            z-index: 1; /* To stay over photo-img */
            color: white;
            text-shadow:
                -1px -1px 0 #000,  
                1px -1px 0 #000,
                -1px 1px 0 #000,
                1px 1px 0 #000;
        }   
        .photo-name {
            text-align: center;
        }   
        .photo-size {
            text-align: center;
        }   
        .photo-img {
            z-index: 0; /* To stay under photo-header */
            position: absolute;
            top: 0; left: 50%;
            transform: translate(-50%, 0);
        }
        </style>

        <div class="photo-button" on-click="_handleClick">
            <div class="photo-header">
                <div class="photo-name">[[photoName]]</div>
                <div class="photo-size">[[photoSize]]</div>
            </div>
            <img class="photo-img" src="[[thumbnailUrl]]"></img>
        </div>
        `;
    };
    static get properties() {
        return {
            photoName: {
                type: String
            },
            photoSize: {
                type: String
            },
            photoUrl: {
                type: String
            },
            thumbnailUrl: {
                type: String
            }
        };
    };

    constructor() {
        super();
    };

    /**
     * User selects this action.
     * @param {Event} event 
     */
    _handleClick(event) {
        this.dispatchEvent(new CustomEvent('ifg-photo-button-click', {bubbles: true, detail: {photoUrl: this.photoUrl}}));
    }
}

customElements.define('ifg-photo-button', IFGPhotoButton);