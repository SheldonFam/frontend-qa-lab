import { Alert, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import type { ApiTestRun } from "../../../types/api";
import { useCancelTestRun } from "../hooks/use-test-runs";
import { isRunFinished } from "../utils/is-run-finished";

interface CancelRunButtonProps {
  run: ApiTestRun;
}

export function CancelRunButton({ run }: CancelRunButtonProps) {
  const [isConfirmOpen, confirmBox] = useDisclosure(false);
  const cancelTestRunMutation = useCancelTestRun();

  function handleClose() {
    confirmBox.close();
    cancelTestRunMutation.reset();
  }

  function handleConfirm() {
    cancelTestRunMutation.mutate(run.id, {
      onSuccess: handleClose,
    });
  }

  return (
    <>
      {!isRunFinished(run.status) && (
        <Button color="red" variant="outline" onClick={confirmBox.open}>
          Cancel Run
        </Button>
      )}

      <Modal
        opened={isConfirmOpen}
        onClose={handleClose}
        title="Cancel this run?"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            The run will be stopped. Results that are already saved are kept. A
            cancelled run cannot be started again.
          </Text>

          {cancelTestRunMutation.isError && (
            <Alert color="red" title="Failed to cancel test run">
              {cancelTestRunMutation.error.message}
            </Alert>
          )}

          <Group justify="flex-end">
            <Button variant="default" onClick={handleClose} data-autofocus>
              Keep Running
            </Button>

            <Button
              color="red"
              onClick={handleConfirm}
              loading={cancelTestRunMutation.isPending}
            >
              Yes, Cancel Run
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
