import * as core from "../core";
import overlay from "../overlay";
import Menu from "../Menu";
import Controller from "properjs-controller";
import bar from "../bar";
import VideoVimeo from "../video/VideoVimeo";


let isActive = false;
const animator = new Controller();


/**
 *
 * @public
 * @class Project
 * @param {Hobo} $node The element
 * @param {object} data The datas
 * @classdesc Handle an index.
 * @memberof projects
 *
 */
class Project {
    constructor ( $node, data ) {
        isActive = true;

        this.$node = $node;
        this.menu = new Menu( !core.env.isConfig() );
        this.data = data;
        this.$plates = this.$node.find( ".js-project-plate" );
        this.$images = this.$node.find( ".js-lazy-image" );
        this.$videos = this.$node.find( ".js-video" );
        this.isEnded = false;

        this.bindEvents();
        this.loadProject();
        this.loadVideos();

        core.log( "Project", this );
    }


    /**
     *
     * @public
     * @instance
     * @method bindEvents
     * @memberof projects.Project
     * @description Bind event handlers for open Project.
     *
     */
    bindEvents () {

    }


    /**
     *
     * @public
     * @instance
     * @method loadProject
     * @memberof projects.Project
     * @description Load images with {@link ImageController}.
     *
     */
    loadProject () {
        // Node must be in DOM for image size to work
        core.dom.project.elementPane.append( this.$node );

        core.images.handleImages( this.$images, this.onPreload.bind( this ) );
    }


    /**
     *
     * @public
     * @instance
     * @method loadVideos
     * @memberof projects.Project
     * @description Load videos from vimeo.
     *
     */
    loadVideos () {
        this.$videos.forEach(( elem, i ) => {
            const $video = this.$videos.eq( i );
            const data = $video.data();

            $video.data( "instance", new VideoVimeo( $video, data ) );
        });
    }


    /**
     *
     * @public
     * @instance
     * @method killVideos
     * @memberof projects.Project
     * @description Kill videos from vimeo.
     *
     */
    killVideos () {
        this.$videos.forEach(( elem, i ) => {
            const $video = this.$videos.eq( i );
            const data = $video.data();

            if ( data.instance ) {
                data.instance.destroy();
                data.instance = null;
            }
        });
    }





    /**
     *
     * @public
     * @instance
     * @method onPreload
     * @memberof projects.Project
     * @description Handle loaded project images.
     *
     */
    onPreload () {
        bar.stop();

        this.cycleAnimation();

        setTimeout( overlay.close(), (core.dom.project.elementTransitionDuration * 2) );
    }


    /**
     *
     * @public
     * @instance
     * @method cycleAnimation
     * @memberof projects.Project
     * @description Run raf cycle to handle animations.
     *
     */
    cycleAnimation () {
        this.onUpdateEmitter();

        animator.stop();
        animator.go( this.onUpdateEmitter.bind( this ) );
    }


    /**
     *
     * @public
     * @instance
     * @method updatePlates
     * @memberof projects.Project
     * @description Update active plates for the project.
     *
     */
    updatePlates () {
        let $plate = null;
        let i = this.$plates.length;

        for ( i; i--; ) {
            $plate = this.$plates.eq( i );

            if ( core.util.isElementInViewport( $plate[ 0 ] ) ) {
                $plate.addClass( "is-active" );

            } else {
                $plate.removeClass( "is-active" );
            }
        }
    }


    /**
     *
     * @public
     * @instance
     * @method updatePosition
     * @memberof projects.Project
     * @description Determine when to teardown a project.
     *
     */
    updatePosition () {
        const nodeRect = this.$node[ 0 ].getBoundingClientRect();

        if ( core.dom.project.element[ 0 ].scrollTop !== 0 && Math.floor( nodeRect.bottom ) <= 0 && !this.isEnded ) {
            this.isEnded = true;

            core.dom.project.element.addClass( "is-hidden" );

            core.emitter.fire( "app--project-ended" );
        }
    }


    /**
     *
     * @public
     * @instance
     * @method onUpdateEmitter
     * @memberof projects.Project
     * @description Handle the raf cycle.
     *
     */
    onUpdateEmitter () {
        this.updatePlates();
        this.updatePosition();

        core.emitter.fire( "app--project-scroll" );
    }


    /**
     *
     * @public
     * @instance
     * @method teardown
     * @memberof projects.Project
     * @description Undo event bindings for this instance.
     *
     */
    teardown () {

        this.killVideos();

        Project.close();
    }
}



/**
 *
 * @public
 * @static
 * @method isActive
 * @memberof projects.Project
 * @description Test if a project is active.
 * @returns {boolean}
 *
 */
Project.isActive = function () {
    return isActive;
};


/**
 *
 * @public
 * @static
 * @method open
 * @memberof projects.Project
 * @description Open the project view element.
 *
 */
Project.open = function () {
    isActive = true;

    bar.load();

    core.dom.html.addClass( "is-offcanvas is-offcanvas--project" );
    core.dom.body.append( core.dom.project.element );

    setTimeout( () => core.dom.project.element.addClass( "is-active" ), 10 );
    setTimeout( () => core.dom.project.element.removeClass( "is-noscroll" ), core.dom.project.elementTransitionDuration );
};


/**
 *
 * @public
 * @static
 * @method close
 * @memberof projects.Project
 * @description Close the project view element.
 *
 */
Project.close = function () {
    isActive = false;

    animator.stop();

    core.dom.project.element.removeClass( "is-active" );

    setTimeout( () => {
        core.dom.html.removeClass( core.config.offcanvasClasses );
        core.dom.project.element.detach().addClass( "is-noscroll" ).removeClass( "is-hidden" );
        core.dom.project.elementPane[ 0 ].innerHTML = "";

    }, core.dom.project.elementTransitionDuration );
};



/******************************************************************************
 * Export
*******************************************************************************/
export default Project;
