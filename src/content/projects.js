/**
 * The Proof archive. Empty until Batch 1 ships, and the page says so.
 *
 * When a student finishes, add one entry here and it goes live with the next
 * deploy. Every field is something a stranger can open and check.
 *
 * @typedef {Object} Project
 * @property {string} id            Stable slug, e.g. 'batch1-aditi'
 * @property {string} student       First name, or the name they want shown
 * @property {string} name          Project name
 * @property {string} line          One line from the student about what it does
 * @property {string} liveUrl       The live URL
 * @property {string} repoUrl       The public repository
 * @property {string} videoUrl      The demo video
 * @property {string} [screenshot]  Path under /public, e.g. '/proof/batch1-aditi.jpg'
 * @property {number} batch         Batch number
 */

/** @type {Project[]} */
export const projects = []
