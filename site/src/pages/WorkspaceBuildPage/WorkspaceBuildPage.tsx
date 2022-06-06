import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import { useMachine } from "@xstate/react"
import { FC } from "react"
import { Helmet } from "react-helmet"
import { useParams } from "react-router-dom"
import { ProvisionerJobLog } from "../../api/typesGenerated"
import { Loader } from "../../components/Loader/Loader"
import { Margins } from "../../components/Margins/Margins"
import { Stack } from "../../components/Stack/Stack"
import { WorkspaceBuildLogs } from "../../components/WorkspaceBuildLogs/WorkspaceBuildLogs"
import { WorkspaceBuildStats } from "../../components/WorkspaceBuildStats/WorkspaceBuildStats"
import { pageTitle } from "../../util/page"
import { workspaceBuildMachine } from "../../xServices/workspaceBuild/workspaceBuildXService"

const sortLogsByCreatedAt = (logs: ProvisionerJobLog[]) => {
  return [...logs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

const useBuildId = () => {
  const { buildId } = useParams()

  if (!buildId) {
    throw new Error("buildId param is required.")
  }

  return buildId
}

export const WorkspaceBuildPage: FC = () => {
  const buildId = useBuildId()
  const [buildState] = useMachine(workspaceBuildMachine, { context: { buildId } })
  const { logs, build } = buildState.context
  const isWaitingForLogs = !buildState.matches("logs.loaded")
  const styles = useStyles()

  return (
    <Margins>
      <Helmet>
        <title>{build ? pageTitle(`Build #${build.build_number} · ${build.workspace_name}`) : ""}</title>
      </Helmet>
      <Stack>
        <Typography variant="h4" className={styles.title}>
          Logs
        </Typography>

        {build && <WorkspaceBuildStats build={build} />}
        {!logs && <Loader />}
        {logs && <WorkspaceBuildLogs logs={sortLogsByCreatedAt(logs)} isWaitingForLogs={isWaitingForLogs} />}
      </Stack>
    </Margins>
  )
}

const useStyles = makeStyles((theme) => ({
  title: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(2),
  },
}))
