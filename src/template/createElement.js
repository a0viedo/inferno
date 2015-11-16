import fragmentValueTypes from '../enum/fragmentValueTypes';
import isArray from '../util/isArray';

export default function createElementFactory(template) {
	return function createElement(tag, props, ...children) {
		let element;
		let is = props && (props.is || null); // type extension
	    let xmlns = props && (props.xmlns || null); // xmlns

		if (typeof tag === 'string') {
			element = template.createElement(tag, xmlns, is);
		} else {
			let propsParsed = props;

			for(let prop in props) {
				if(props[prop].pointer) {
					propsParsed[prop] = this.templateValues[propsParsed[prop].pointer];
				}
			}
			element = {
				dom: null,
				component: this.templateValue || this.templateValues[tag.pointer],
				props: propsParsed,
				key: null,
				template: null,
				templateIndex: tag.pointer
			};
			return element;
		}

		const len = children.length;

		if(len > 0) {
			if (len > 1) {
				for (let i = 0; i < len; i++) {
					let child = children[i];

					if (child.pointer !== undefined) {
						let value = this.templateValue || this.templateValues[child.pointer];

						if (typeof value !== 'object') {
							let node = template.createTextNode(value);

							if(this.templateValue) {
								this.templateElement = node;
								this.templateType = fragmentValueTypes.TEXT_DIRECT;
							} else {
								this.templateElements[child.pointer] = node;
								this.templateTypes[child.pointer] = fragmentValueTypes.TEXT_DIRECT;
							}
							element.appendChild(node);
						}
					} else if (typeof child !== 'object') {
						let node = template.createTextNode(child);

						element.appendChild(node);
					} else if (child.component) {
						if(this.templateValues) {
							let templateIndex = child.templateIndex;

							this.templateElements[templateIndex] = element;
							this.templateTypes[templateIndex] = fragmentValueTypes.FRAGMENT;
							this.templateValues[templateIndex] = child;
						} else {
							this.templateElement = element;
							this.templateType = fragmentValueTypes.FRAGMENT;
							this.templateValue = child;
						}
					} else {
						element.appendChild(child);
					}
				}
			}
			else if ((children = children[0]) && children.pointer !== undefined) {
				let value = this.templateValue || this.templateValues[children.pointer];

				if (typeof value !== 'object') {
					element.textContent = value;
					if(this.templateValue) {
						this.templateElement = element;
						this.templateType = fragmentValueTypes.TEXT;
					} else {
						this.templateElements[children.pointer] = element;
						this.templateTypes[children.pointer] = fragmentValueTypes.TEXT;
					}
				} else if (isArray(value)) {
					if(this.templateValue) {
						this.templateElement = element;
						this.templateType = fragmentValueTypes.LIST;
					} else {
						this.templateElements[children.pointer] = element;
						this.templateTypes[children.pointer] = fragmentValueTypes.LIST;
					}
				}
			}
			else if (typeof children !== 'object') {
				element.textContent = children;
			}
			else if (children && children.component) {
				this.templateElement = element;
				this.templateType = fragmentValueTypes.FRAGMENT;
				this.templateValue = children;
			} else if (children) {
				element.appendChild(children);
			}
		}

		if (props) {
			template.addAttributes(element, props, this);
		}

		return element;
	}
}
