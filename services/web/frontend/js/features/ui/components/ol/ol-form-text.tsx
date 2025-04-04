import FormText, {
  FormTextProps,
  getFormTextClass,
} from '@/features/ui/components/bootstrap-5/form/form-text'
import PolymorphicComponent from '@/shared/components/polymorphic-component'
import BootstrapVersionSwitcher from '@/features/ui/components/bootstrap-5/bootstrap-version-switcher'
import classnames from 'classnames'
import { getAriaAndDataProps } from '@/features/utils/bootstrap-5'

type OLFormTextProps = FormTextProps & {
  bs3Props?: Record<string, unknown>
}

function OLFormText({ as = 'div', ...props }: OLFormTextProps) {
  const { bs3Props, ...rest } = props

  const bs3HelpBlockProps = {
    children: rest.children,
    className: classnames('small', rest.className, getFormTextClass(rest.type)),
    ...bs3Props,
  } as const satisfies React.ComponentProps<typeof PolymorphicComponent>

  // Get all `aria-*` and `data-*` attributes
  const extraProps = getAriaAndDataProps(rest)

  return (
    <BootstrapVersionSwitcher
      bs3={
        <PolymorphicComponent {...bs3HelpBlockProps} {...extraProps} as={as} />
      }
      bs5={<FormText {...rest} as={as} />}
    />
  )
}

export default OLFormText
