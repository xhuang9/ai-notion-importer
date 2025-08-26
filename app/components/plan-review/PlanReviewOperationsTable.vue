<template>
  <div class="overflow-x-auto">
    <table class="w-full border border-gray-200 rounded-lg">
      <thead class="bg-gray-50">
        <tr>
          <th class="table-cell text-left font-semibold">
            <input
              type="checkbox"
              :checked="allApproved && operations.length > 0"
              :indeterminate="approvedCount > 0 && !allApproved"
              @change="$emit('toggle-all-approval')"
              class="mr-2"
            />
            Approve
          </th>
          <th class="table-cell text-left font-semibold">Operation</th>
          <th class="table-cell text-left font-semibold">Task Details</th>
          <th class="table-cell text-left font-semibold">Reason</th>
          <th class="table-cell text-left font-semibold">Confidence</th>
          <th class="table-cell text-left font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody>
        <PlanReviewOperationRow
          v-for="(operation, index) in operations"
          :key="operation.id"
          :operation="operation"
          @toggle-approval="$emit('toggle-operation-approval', index)"
          @edit="$emit('edit-operation', index)"
          @delete="$emit('delete-operation', index)"
        />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Props {
  operations: OperationPlan[]
  approvedCount: number
  allApproved: boolean
}

interface Emits {
  'toggle-all-approval': []
  'toggle-operation-approval': [index: number]
  'edit-operation': [index: number]
  'delete-operation': [index: number]
}

defineProps<Props>()
defineEmits<Emits>()
</script>